'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardShellProps {
  kicker?: string;
  title?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  accentGlow?: boolean;
  animate?: boolean;
  className?: string;
  children: ReactNode;
}

export default function CardShell({
  kicker,
  title,
  icon,
  badge,
  animate = true,
  className = '',
  children,
}: CardShellProps) {
  const hasHeader = kicker || title || icon || badge;

  const inner = (
    <div className={`panel relative p-5 ${className}`}>
      {hasHeader && (
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            {icon && (
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-[#EEF1FF] text-[#3D4FE0]">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {kicker && <p className="kicker mb-0.5">{kicker}</p>}
              {title && (
                <h3 className="font-heading text-base font-bold text-[#0C1222] tracking-tight leading-tight truncate">
                  {title}
                </h3>
              )}
            </div>
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}
      {children}
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {inner}
    </motion.div>
  );
}
