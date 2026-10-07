import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-md w-full px-4">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-50 border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900/90 text-rose-50 border-rose-700'
                : 'bg-slate-900/90 text-slate-50 border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            <div className="flex-1 font-medium leading-relaxed">{toastMessage.text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
