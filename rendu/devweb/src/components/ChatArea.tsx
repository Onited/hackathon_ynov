import { useEffect, useRef } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import type { ChatSession, Theme } from '../types';
import { MessageBubble } from './MessageBubble';
import { WelcomeScreen } from './WelcomeScreen';
import { InputBar } from './InputBar';

interface ChatAreaProps {
  session: ChatSession | null;
  isGenerating: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onSend: (message: string) => void;
  onStop: () => void;
}

export function ChatArea({ session, isGenerating, theme, onToggleTheme, onToggleSidebar, onSend, onStop }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session?.messages]);

  const hasMessages = session && session.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50/50 dark:bg-[#0a0a12] transition-colors duration-300">
      {/* Header */}
      <header className="h-13 flex items-center justify-between px-4 border-b border-slate-200/60 dark:border-white/5
        bg-white/60 dark:bg-[#0a0a12]/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          {session && (
            <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">
              {session.title}
            </h2>
          )}
        </div>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-muted
            hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200
            hover:rotate-12"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Messages or Welcome */}
      {hasMessages ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {session.messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isGenerating && i === session.messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
        </div>
      ) : (
        <WelcomeScreen onSuggestion={onSend} />
      )}

      {/* Input */}
      <InputBar onSend={onSend} onStop={onStop} isGenerating={isGenerating} />
    </div>
  );
}
