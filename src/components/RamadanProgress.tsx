'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { RAMADAN_2026 } from '@/lib/constants';

interface RamadanProgressProps {
  currentDate?: Date;
}

export function RamadanProgress({ currentDate = new Date() }: RamadanProgressProps) {
  const { startDate, endDate, hijriYear } = RAMADAN_2026;

  // Calculate current day of Ramadan
  const daysSinceStart = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentDay = Math.max(1, Math.min(daysSinceStart + 1, totalDays));
  const progress = (currentDay / totalDays) * 100;

  // Check if we're in Ramadan
  const isBeforeRamadan = currentDate < startDate;
  const isAfterRamadan = currentDate > endDate;
  const isInRamadan = !isBeforeRamadan && !isAfterRamadan;

  if (isBeforeRamadan) {
    const daysUntilRamadan = Math.ceil(
      (startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center px-4"
      >
        <p className="text-theme-text/70 text-sm">
          Ramadan {hijriYear} begins in{' '}
          <span className="text-theme-accent font-semibold">{daysUntilRamadan} days</span>
        </p>
      </motion.div>
    );
  }

  if (isAfterRamadan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center px-4"
      >
        <p className="text-theme-text/70 text-sm">
          Ramadan {hijriYear} has ended. See you next year!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-theme-accent" />
        <span className="text-theme-text/80 text-sm">
          Day {currentDay} of {totalDays} &middot; Ramadan {hijriYear}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-theme-text/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute left-0 top-0 h-full bg-theme-accent rounded-full"
        />
        {/* Moon indicator */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4
                     bg-theme-accent rounded-full shadow-lg border-2 border-white"
        />
      </div>

      <p className="text-center text-theme-text/50 text-xs mt-2">
        {Math.round(progress)}% complete
      </p>
    </motion.div>
  );
}
