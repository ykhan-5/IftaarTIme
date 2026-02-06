'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { City, POPULAR_CITIES } from '@/lib/constants';
import { calculatePrayerTimes, formatTime } from '@/lib/prayer-times';
import { DateTime } from 'luxon';

interface CityComparisonProps {
  currentCity: City | null;
}

export function CityComparison({ currentCity }: CityComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const comparisonData = useMemo(() => {
    if (!currentCity) return [];

    const now = new Date();
    const currentTimes = calculatePrayerTimes(currentCity.lat, currentCity.lng, now);
    const currentIftarMs = currentTimes.maghrib.getTime();

    return POPULAR_CITIES
      .filter((city) => city.name !== currentCity.name)
      .slice(0, 5)
      .map((city) => {
        const times = calculatePrayerTimes(city.lat, city.lng, now);
        const iftarMs = times.maghrib.getTime();
        const diffMs = iftarMs - currentIftarMs;
        const diffMins = Math.round(diffMs / (1000 * 60));

        // Format the time in the city's timezone
        const iftarInCityTz = DateTime.fromJSDate(times.maghrib).setZone(city.timezone);

        // Check if it's a different day
        const currentDt = DateTime.fromJSDate(now).setZone(currentCity.timezone);
        const cityDt = iftarInCityTz;
        const isTomorrow = cityDt.day > currentDt.day || cityDt.month > currentDt.month;

        return {
          city,
          iftarTime: formatTime(times.maghrib, city.timezone),
          diffMins,
          isTomorrow,
        };
      })
      .sort((a, b) => a.diffMins - b.diffMins);
  }, [currentCity]);

  if (!currentCity) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-3
                   text-theme-text/60 hover:text-theme-text transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">Compare with other cities</span>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4 space-y-2">
              {/* Current city */}
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-theme-accent/10">
                <span className="text-theme-text font-medium">{currentCity.name}</span>
                <span className="text-theme-accent font-mono">
                  {formatTime(
                    calculatePrayerTimes(currentCity.lat, currentCity.lng).maghrib,
                    currentCity.timezone
                  )}
                </span>
              </div>

              {/* Other cities */}
              {comparisonData.map(({ city, iftarTime, diffMins, isTomorrow }) => (
                <motion.div
                  key={city.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between px-4 py-2 rounded-lg
                             bg-theme-text/5 hover:bg-theme-text/10 transition-colors"
                >
                  <span className="text-theme-text/80">{city.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-theme-text font-mono">{iftarTime}</span>
                    <span
                      className={`text-sm ${
                        diffMins > 0 ? 'text-orange-500' : 'text-green-500'
                      }`}
                    >
                      {diffMins > 0 ? '+' : ''}
                      {Math.abs(diffMins) < 60
                        ? `${diffMins}m`
                        : `${Math.floor(Math.abs(diffMins) / 60)}h ${Math.abs(diffMins) % 60}m`}
                      {isTomorrow && ' (tomorrow)'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
