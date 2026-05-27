import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'loot' | 'combat';
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgClass = 'bg-[#FEF9E1] border-on-surface text-on-surface';
          let icon = 'military_tech';
          let iconColor = 'text-primary';

          if (toast.type === 'warning') {
            bgClass = 'bg-primary border-on-surface text-white';
            icon = 'warning';
            iconColor = 'text-secondary-fixed';
          } else if (toast.type === 'loot') {
            bgClass = 'bg-secondary-container border-on-surface text-on-secondary-container';
            icon = 'monetization_on';
            iconColor = 'text-primary';
          } else if (toast.type === 'combat') {
            bgClass = 'bg-inverse-surface border-on-surface text-white';
            icon = 'swords';
            iconColor = 'text-error';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={() => removeToast(toast.id)}
              className={`pointer-events-auto cursor-pointer p-4 border-4 pixel-border-sm flex items-center gap-3 active:scale-95 transition-all outline-none ${bgClass}`}
            >
              <span className={`material-symbols-outlined text-2xl ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
              <p className="font-headline font-bold text-sm uppercase flex-1 leading-tight tracking-wider">
                {toast.message}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="material-symbols-outlined text-lg leading-none hover:text-red-500 transition-colors"
              >
                close
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
