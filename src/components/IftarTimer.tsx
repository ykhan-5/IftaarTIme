'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Moon } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { formatTime } from '@/lib/prayer-times';

interface IftarTimerProps {
  cityName: string;
  country: string;
  iftarTime: Date | null;
  timezone: string;
  isIftarToday: boolean;
}

export function IftarTimer({
  cityName,
  country,
  iftarTime,
  timezone,
  isIftarToday,
}: IftarTimerProps) {
  const countdown = useCountdown(iftarTime);

  const displayLocation = country
    ? `${cityName}, ${country}`
    : cityName;

  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h2 className="text-xl md:text-2xl font-light tracking-wide text-theme-text opacity-80">
          {displayLocation}
        </h2>
      </motion.div>

      {/* Moon Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="mb-6"
      >
        <Moon className="w-12 h-12 md:w-16 md:h-16 text-theme-accent" />
      </motion.div>

      {/* Iftar Time */}
      {iftarTime && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2"
        >
          <div className="text-6xl md:text-8xl lg:text-[120px] font-bold tracking-tight font-mono tabular-nums text-theme-text">
            {formatTime(iftarTime, timezone)}
          </div>
        </motion.div>
      )}

      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <span className="text-sm md:text-lg uppercase tracking-widest text-theme-text opacity-60">
          {isIftarToday ? 'Iftar Time Today' : 'Iftar Time Tomorrow'}
        </span>
      </motion.div>

      {/* Countdown */}
      <AnimatePresence mode="wait">
        {countdown.isPast ? (
          <motion.div
            key="passed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-3xl md:text-5xl font-medium text-theme-accent">
              Time to break your fast!
            </span>
            <span className="text-lg text-theme-text opacity-70">
              May your fast be accepted
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-4xl md:text-6xl lg:text-7xl font-medium font-mono tabular-nums text-theme-text">
              <CountdownDigits countdown={countdown} />
            </div>
            <span className="text-sm md:text-base uppercase tracking-widest text-theme-text opacity-60">
              Time Remaining
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CountdownDigitsProps {
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

function CountdownDigits({ countdown }: CountdownDigitsProps) {
  const { hours, minutes, seconds } = countdown;

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <DigitPair value={hours} label="h" />
      <span className="text-theme-accent opacity-80">:</span>
      <DigitPair value={minutes} label="m" />
      <span className="text-theme-accent opacity-80">:</span>
      <DigitPair value={seconds} label="s" />
    </div>
  );
}

function DigitPair({ value, label }: { value: number; label: string }) {
  const displayValue = value.toString().padStart(2, '0');

  return (
    <div className="flex items-baseline">
      <motion.span
        key={displayValue}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block min-w-[1.5ch] text-center"
      >
        {displayValue}
      </motion.span>
      <span className="text-xs md:text-sm opacity-50 ml-0.5">{label}</span>
    </div>
  );
}
