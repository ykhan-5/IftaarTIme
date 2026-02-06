'use client';

import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
  formatted: string;
}

export function useCountdown(targetDate: Date | null): CountdownResult {
  const calculateTimeLeft = useCallback((): CountdownResult => {
    if (!targetDate) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        isPast: true,
        formatted: '0:00:00',
      };
    }

    const now = new Date().getTime();
    const target = targetDate.getTime();
    const diff = target - now;

    if (diff <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        isPast: true,
        formatted: '0:00:00',
      };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Format with padding
    const formattedHours = hours.toString();
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return {
      hours,
      minutes,
      seconds,
      totalMs: diff,
      isPast: false,
      formatted: `${formattedHours}:${formattedMinutes}:${formattedSeconds}`,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeLeft);

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  return timeLeft;
}
