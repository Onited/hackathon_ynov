import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`group py-5 px-4 sm:px-6 ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-50/50 dark:bg-white/[0.02]'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
          isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-500 dark:to-slate-700'
            : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20'
        }`}>
          {isUser
            ? <User className="w-3.5 h-3.5 text-white" />
            : <Bot className="w-3.5 h-3.5 text-white" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-muted">
            {isUser ? 'Vous' : 'TechCorp AI'}
          </p>

          <div className={`prose prose-sm dark:prose-invert max-w-none
            prose-p:leading-relaxed prose-p:mb-3
            prose-pre:bg-slate-900 prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10
            prose-code:text-indigo-400 prose-code:before:content-none prose-code:after:content-none
            prose-headings:font-semibold
            text-slate-700 dark:text-slate-300
            ${isStreaming && !message.content ? 'animate-pulse-soft' : ''}`}
          >
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : isStreaming ? (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : null}
          </div>

          {/* Copy action on hover */}
          {!isUser && message.content && !isStreaming && (
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]
                  text-muted hover:text-slate-700 dark:hover:text-slate-200
                  hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
