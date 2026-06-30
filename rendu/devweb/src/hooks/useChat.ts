import { useState, useCallback, useRef } from 'react';
import type { ChatSession, Message } from '../types';
import { streamGenerate } from '../lib/api';

const STORAGE_KEY = 'techcorp-sessions';
const ACTIVE_KEY = 'techcorp-active';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeId, setActiveId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_KEY);
  });
  // Track which sessions are currently generating (allows parallel generations)
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  // Store AbortControllers per session so we can cancel properly
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const activeSession = sessions.find((s) => s.id === activeId) || null;
  const isGenerating = activeId ? generatingIds.has(activeId) : false;

  const persistAndSet = useCallback((next: ChatSession[]) => {
    setSessions(next);
    saveSessions(next);
  }, []);

  const createSession = useCallback(() => {
    const session: ChatSession = {
      id: generateId(),
      title: 'Nouvelle conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const next = [session, ...sessions];
    persistAndSet(next);
    setActiveId(session.id);
    localStorage.setItem(ACTIVE_KEY, session.id);
    return session.id;
  }, [sessions, persistAndSet]);

  const selectSession = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const deleteSession = useCallback((id: string) => {
    // Abort any ongoing generation for this session
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(id);
    }
    const next = sessions.filter((s) => s.id !== id);
    persistAndSet(next);
    if (activeId === id) {
      const newActive = next.length > 0 ? next[0].id : null;
      setActiveId(newActive);
      if (newActive) localStorage.setItem(ACTIVE_KEY, newActive);
      else localStorage.removeItem(ACTIVE_KEY);
    }
  }, [sessions, activeId, persistAndSet]);

  const sendMessage = useCallback(async (content: string) => {
    let targetId = activeId;

    if (!targetId) {
      const session: ChatSession = {
        id: generateId(),
        title: content.slice(0, 40) + (content.length > 40 ? '…' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      targetId = session.id;
      setSessions((prev) => {
        const next = [session, ...prev];
        saveSessions(next);
        return next;
      });
      setActiveId(targetId);
      localStorage.setItem(ACTIVE_KEY, targetId);
    }

    const userMsg: Message = { id: generateId(), role: 'user', content, timestamp: Date.now() };
    const assistantMsg: Message = { id: generateId(), role: 'assistant', content: '', timestamp: Date.now() };
    const capturedId = targetId;

    // Add user message + empty assistant placeholder
    setSessions((prev) => {
      const next = prev.map((s) => {
        if (s.id !== capturedId) return s;
        const title = s.messages.length === 0 ? content.slice(0, 40) + (content.length > 40 ? '…' : '') : s.title;
        return { ...s, title, messages: [...s.messages, userMsg, assistantMsg], updatedAt: Date.now() };
      });
      saveSessions(next);
      return next;
    });

    // Create an AbortController for this specific generation
    const controller = new AbortController();
    abortControllers.current.set(capturedId, controller);

    setGeneratingIds((prev) => new Set(prev).add(capturedId));

    try {
      for await (const token of streamGenerate(content, 'phi3-financial', controller.signal)) {
        setSessions((prev) => {
          const next = prev.map((s) => {
            if (s.id !== capturedId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: m.content + token } : m
              ),
            };
          });
          saveSessions(next);
          return next;
        });
      }
    } catch (err: unknown) {
      // Don't show error if it was manually aborted
      if (err instanceof Error && err.name === 'AbortError') return;
      setSessions((prev) => {
        const next = prev.map((s) => {
          if (s.id !== capturedId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: m.content || '⚠️ Erreur de connexion. Vérifiez qu\'Ollama est en cours d\'exécution.' }
                : m
            ),
          };
        });
        saveSessions(next);
        return next;
      });
    } finally {
      abortControllers.current.delete(capturedId);
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(capturedId);
        return next;
      });
    }
  }, [activeId]);

  const stopGenerating = useCallback(() => {
    if (activeId) {
      const controller = abortControllers.current.get(activeId);
      if (controller) controller.abort();
    }
  }, [activeId]);

  return {
    sessions,
    activeSession,
    activeId,
    isGenerating,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    stopGenerating,
  };
}
