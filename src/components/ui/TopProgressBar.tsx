'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export default function TopProgressBar() {
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const { fetchStatus, liveAuditStatus, comparisonLoading } = useAppStore();

  const isLoading =
    fetchStatus === 'loading' ||
    liveAuditStatus === 'loading' ||
    Boolean(comparisonLoading);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let timer: NodeJS.Timeout;
    let completionTimer: NodeJS.Timeout;

    if (isLoading) {
      setVisible(true);
      setProgress((prev) => (prev > 0 && prev < 90 ? prev : 12));

      // Realistic progressive tick: moves from 12% to ~85%
      timer = setInterval(() => {
        setProgress((curr) => {
          if (curr < 30) return curr + Math.random() * 12 + 8;
          if (curr < 65) return curr + Math.random() * 6 + 4;
          if (curr < 86) return curr + Math.random() * 2 + 1;
          return curr; // Hold around 85-88% until request completes
        });
      }, 200);
    } else if (visible) {
      // Rapidly complete to 100%
      setProgress(100);

      // Fade out after completion
      completionTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(completionTimer);
    };
  }, [isLoading, isMounted, visible]);

  if (!isMounted || !visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none overflow-hidden bg-transparent">
      <motion.div
        className="h-full relative bg-gradient-to-r from-[#590907] via-[#E8D2B5] to-[#590907]"
        style={{
          width: `${progress}%`,
        }}
        initial={{ width: '0%', opacity: 1 }}
        animate={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0.9 : 1,
        }}
        transition={{
          width: {
            duration: progress === 100 ? 0.2 : 0.35,
            ease: progress === 100 ? 'easeOut' : [0.16, 1, 0.3, 1],
          },
          opacity: { duration: 0.3 },
        }}
      >
        {/* Glowing tip accent on the leading edge */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-full bg-[#E8D2B5]"
          style={{
            boxShadow: '0 0 10px 2px #E8D2B5, 0 0 4px #590907',
          }}
        />
      </motion.div>
    </div>
  );
}
