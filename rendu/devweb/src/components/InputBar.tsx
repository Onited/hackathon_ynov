import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

interface InputBarProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function InputBar({ onSend, onStop, isGenerating }: InputBarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a12]/80 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto p-4">
        <div
          className="flex items-end gap-2 p-2 rounded-2xl
            border border-slate-200/80 dark:border-white/10
            bg-white dark:bg-white/5
            focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40
            focus-within:shadow-lg focus-within:shadow-indigo-500/5
            transition-all duration-300"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question financière..."
            rows={1}
            className="flex-1 px-2 py-1.5 bg-transparent text-sm resize-none outline-none
              text-slate-900 dark:text-white
              placeholder:text-muted/60
              max-h-[200px]"
          />
          {isGenerating ? (
            <button
              onClick={onStop}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                bg-red-500/10 hover:bg-red-500/20
                text-red-500 transition-colors duration-200"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${input.trim()
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105'
                  : 'bg-slate-100 dark:bg-white/5 text-muted/40 cursor-not-allowed'
                }`}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-center text-[10px] text-muted/50 mt-2">
          TechCorp AI peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
}
