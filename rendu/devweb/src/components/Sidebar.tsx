import { useState } from 'react';
import { Plus, MessageSquare, Trash2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function groupByDate(sessions: ChatSession[]) {
  const now = Date.now();
  const today: ChatSession[] = [];
  const yesterday: ChatSession[] = [];
  const week: ChatSession[] = [];
  const older: ChatSession[] = [];

  for (const s of sessions) {
    const diff = now - s.updatedAt;
    if (diff < 86400000) today.push(s);
    else if (diff < 172800000) yesterday.push(s);
    else if (diff < 604800000) week.push(s);
    else older.push(s);
  }

  return [
    { label: "Aujourd'hui", items: today },
    { label: 'Hier', items: yesterday },
    { label: '7 derniers jours', items: week },
    { label: 'Plus ancien', items: older },
  ].filter((g) => g.items.length > 0);
}

export function Sidebar({ sessions, activeId, onNewChat, onSelect, onDelete, isOpen, onClose }: SidebarProps) {
  const groups = groupByDate(sessions);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col
          w-72 border-r
          bg-white/80 dark:bg-[#0f0f1a]/90
          backdrop-blur-xl
          border-slate-200/60 dark:border-white/5
          transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">TechCorp AI</h1>
              <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wider font-medium">Financial Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
              text-sm font-medium
              border border-slate-200/80 dark:border-white/10
              bg-white/50 dark:bg-white/5
              hover:bg-indigo-50 dark:hover:bg-indigo-500/10
              hover:border-indigo-300 dark:hover:border-indigo-500/30
              text-slate-700 dark:text-slate-200
              hover:text-indigo-700 dark:hover:text-indigo-300
              transition-all duration-200 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Nouvelle conversation
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
                {group.label}
              </p>
              {group.items.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeId}
                  onSelect={() => { onSelect(session.id); onClose(); }}
                  onDelete={() => onDelete(session.id)}
                />
              ))}
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="px-3 py-8 text-center">
              <MessageSquare className="w-8 h-8 text-muted/30 mx-auto mb-2" />
              <p className="text-xs text-muted">Aucune conversation</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SessionItem({ session, isActive, onSelect, onDelete }: {
  session: ChatSession; isActive: boolean; onSelect: () => void; onDelete: () => void;
}) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
        text-sm transition-all duration-200 mb-0.5
        ${isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5'
        }`}
    >
      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-500' : 'text-muted/50'}`} />
      <span className="truncate flex-1">{session.title}</span>
      {hovering && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-muted hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
