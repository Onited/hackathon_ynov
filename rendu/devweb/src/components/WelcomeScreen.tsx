import { Sparkles, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  { icon: TrendingUp, text: "Explique-moi les différents types d'investissements financiers", color: 'from-blue-500 to-cyan-500' },
  { icon: Shield, text: 'Quels sont les risques liés à la volatilité des marchés ?', color: 'from-emerald-500 to-teal-500' },
  { icon: BarChart3, text: "Comment analyser un bilan financier d'entreprise ?", color: 'from-orange-500 to-amber-500' },
];

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600
            flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Comment puis-je vous aider ?
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Assistant financier spécialisé propulsé par Phi-3.5. Posez vos questions sur la finance, l'économie ou les marchés.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-3">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
              onClick={() => onSuggestion(s.text)}
              className="group flex flex-col items-start gap-3 p-4 rounded-xl text-left
                border border-slate-200/80 dark:border-white/5
                bg-white/60 dark:bg-white/[0.03]
                hover:bg-white dark:hover:bg-white/[0.06]
                hover:border-indigo-200 dark:hover:border-indigo-500/20
                hover:shadow-lg hover:shadow-indigo-500/5
                transition-all duration-300"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color}
                flex items-center justify-center shadow-sm
                group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {s.text}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
