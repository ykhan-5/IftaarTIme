'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  calculatePrayerTimes,
  PrayerTimesResult,
  CalculationMethodId,
  getNextIftarTime,
} from '@/lib/prayer-times';

interface UsePrayerTimesOptions {
  lat: number;
  lng: number;
  method?: CalculationMethodId;
}

interface UsePrayerTimesResult {
  prayerTimes: PrayerTimesResult | null;
  nextIftar: Date | null;
  isIftarToday: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function usePrayerTimes({
  lat,
  lng,
  method = 'ISNA',
}: UsePrayerTimesOptions): UsePrayerTimesResult {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [nextIftar, setNextIftar] = useState<Date | null>(null);
  const [isIftarToday, setIsIftarToday] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lat || !lng) {
      setIsLoading(false);
      return;
    }

    try {
      // Calculate today's prayer times
      const times = calculatePrayerTimes(lat, lng, new Date(), method);
      setPrayerTimes(times);

      // Get next iftar (today or tomorrow)
      const { iftarTime, isToday } = getNextIftarTime(lat, lng, method);
      setNextIftar(iftarTime);
      setIsIftarToday(isToday);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to calculate prayer times'));
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng, method]);

  // Recalculate at midnight to update for new day
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      if (lat && lng) {
        const times = calculatePrayerTimes(lat, lng, new Date(), method);
        setPrayerTimes(times);

        const { iftarTime, isToday } = getNextIftarTime(lat, lng, method);
        setNextIftar(iftarTime);
        setIsIftarToday(isToday);
      }
    }, timeUntilMidnight + 1000); // Add 1 second buffer

    return () => clearTimeout(timeout);
  }, [lat, lng, method]);

  return {
    prayerTimes,
    nextIftar,
    isIftarToday,
    isLoading,
    error,
  };
}
