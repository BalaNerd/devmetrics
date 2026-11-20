'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
}

const PULL_THRESHOLD = 64;
const MAX_PULL = 110;

export default function PullToRefresh({
  children,
  onRefresh,
  isRefreshing = false,
}: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only engage pull when scrolled to the very top
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && window.scrollY <= 0) {
      // Damped exponential rubber-banding resistance
      const damped = Math.min(MAX_PULL, Math.pow(diff, 0.85) * 1.8);
      setPullY(damped);
    } else {
      setPullY(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullY >= PULL_THRESHOLD && !isRefreshing) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(15);
        } catch {
          // Ignore vibrate restrictions
        }
      }
      setPullY(PULL_THRESHOLD * 0.75);
      try {
        await onRefresh();
      } finally {
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  };

  const pullProgress = Math.min(pullY / PULL_THRESHOLD, 1);
  const showIndicator = pullY > 8 || isRefreshing;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-screen"
    >
      {/* Sleek Mobile Tension Pull Indicator */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: isRefreshing ? 20 : pullY * 0.7,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none md:hidden"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#180d0d] border border-[#A5A79B]/25 shadow-xl shadow-black/80">
              <div
                className={`w-6 h-6 rounded-full bg-[#590907] flex items-center justify-center text-[#E8D2B5] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                style={{
                  transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)`,
                }}
              >
                <RefreshCw size={12} strokeWidth={2.5} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#E8D2B5]">
                {isRefreshing
                  ? 'Refreshing...'
                  : pullY >= PULL_THRESHOLD
                  ? 'Release to Refresh'
                  : 'Pull to Refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          transform: pullY > 0 && !isRefreshing ? `translateY(${pullY * 0.4}px)` : undefined,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
