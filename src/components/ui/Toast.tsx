'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function Toast() {
  const { toast, setToast } = useAppStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#E3E8F2] bg-white shadow-xl max-w-md"
          >
            {toast.type === 'error' ? (
              <AlertTriangle size={16} className="text-[#E11D48] shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle size={16} className="text-[#0E9F6E] shrink-0" />
            ) : (
              <Info size={16} className="text-[#3D4FE0] shrink-0" />
            )}
            <p className="text-sm text-[#0C1222] leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg text-[#5C6A80] hover:text-[#0C1222]"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
