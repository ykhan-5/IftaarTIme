'use client';

import { motion } from 'framer-motion';
import { Sunrise, Sunset, Moon, Sun } from 'lucide-react';
import { PrayerTimesResult, formatTime } from '@/lib/prayer-times';

interface PrayerTimesPanelProps {
  prayerTimes: PrayerTimesResult | null;
  timezone: string;
}

export function PrayerTimesPanel({ prayerTimes, timezone }: PrayerTimesPanelProps) {
  if (!prayerTimes) return null;

  const times = [
    {
      name: 'Suhoor Ends',
      time: prayerTimes.fajr,
      icon: Moon,
      description: 'Stop eating',
    },
    {
      name: 'Fajr',
      time: prayerTimes.fajr,
      icon: Moon,
      description: 'Dawn prayer',
    },
    {
      name: 'Sunrise',
      time: prayerTimes.sunrise,
      icon: Sunrise,
      description: '',
    },
    {
      name: 'Dhuhr',
      time: prayerTimes.dhuhr,
      icon: Sun,
      description: 'Noon prayer',
    },
    {
      name: 'Asr',
      time: prayerTimes.asr,
      icon: Sun,
      description: 'Afternoon prayer',
    },
    {
      name: 'Maghrib',
      time: prayerTimes.maghrib,
      icon: Sunset,
      description: 'Iftar time',
      highlight: true,
    },
    {
      name: 'Isha',
      time: prayerTimes.isha,
      icon: Moon,
      description: 'Night prayer',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      <h3 className="text-center text-theme-text/60 text-sm uppercase tracking-widest mb-4">
        Today&apos;s Prayer Times
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {times.map((prayer, index) => {
          const Icon = prayer.icon;
          return (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-xl text-center transition-all duration-300
                ${
                  prayer.highlight
                    ? 'bg-theme-accent/20 border-2 border-theme-accent/50'
                    : 'bg-theme-text/5 border border-theme-text/10'
                }`}
            >
              <Icon
                className={`w-5 h-5 mx-auto mb-2 ${
                  prayer.highlight ? 'text-theme-accent' : 'text-theme-text/60'
                }`}
              />
              <p className="text-xs text-theme-text/60 mb-1">{prayer.name}</p>
              <p
                className={`text-lg font-semibold font-mono ${
                  prayer.highlight ? 'text-theme-accent' : 'text-theme-text'
                }`}
              >
                {formatTime(prayer.time, timezone)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
