'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimePhase, TIME_PHASES } from '@/lib/constants';
import { PrayerTimesResult } from '@/lib/prayer-times';

interface UseTimePhaseResult {
  phase: TimePhase;
  theme: typeof TIME_PHASES[TimePhase];
}

export function useTimePhase(prayerTimes: PrayerTimesResult | null): UseTimePhaseResult {
  const calculatePhase = useCallback((): TimePhase => {
    if (!prayerTimes) {
      return 'afternoon'; // Default
    }

    const now = new Date();
    const { fajr, maghrib, isha } = prayerTimes;

    // Calculate key time thresholds
    const threeHoursBeforeIftar = new Date(maghrib.getTime() - 3 * 60 * 60 * 1000);
    const thirtyMinsBeforeIftar = new Date(maghrib.getTime() - 30 * 60 * 1000);
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const noon = new Date(now);
    noon.setHours(12, 0, 0, 0);

    // Determine phase based on current time
    if (now < fajr) {
      // Before Fajr - late night
      return 'lateNight';
    } else if (now < noon) {
      // Fajr to Noon - morning
      return 'morning';
    } else if (now < threeHoursBeforeIftar) {
      // Noon to 3 hours before iftar - afternoon
      return 'afternoon';
    } else if (now < thirtyMinsBeforeIftar) {
      // 3 hours to 30 mins before iftar - pre-iftar
      return 'preIftar';
    } else if (now < maghrib) {
      // 30 mins before to iftar - near iftar
      return 'nearIftar';
    } else if (now < midnight) {
      // After iftar to midnight
      return 'afterIftar';
    } else {
      // After midnight (shouldn't reach here due to date handling)
      return 'lateNight';
    }
  }, [prayerTimes]);

  const [phase, setPhase] = useState<TimePhase>(calculatePhase);

  useEffect(() => {
    // Initial calculation
    setPhase(calculatePhase());

    // Update every minute to check for phase changes
    const interval = setInterval(() => {
      setPhase(calculatePhase());
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [calculatePhase]);

  return {
    phase,
    theme: TIME_PHASES[phase],
  };
}
