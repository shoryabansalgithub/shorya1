'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonBox = ({ className = '' }: { className?: string }) => (
  <motion.div
    animate={{ opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    className={`bg-gray-200 dark:bg-gray-800 rounded-md ${className}`}
  />
);

export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox key={`r-${r}-c-${c}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 space-y-4">
    <div className="flex items-center gap-4">
      <SkeletonBox className="w-12 h-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonBox className="h-4 w-1/2" />
        <SkeletonBox className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonBox className="h-24 w-full rounded-lg" />
  </div>
);
