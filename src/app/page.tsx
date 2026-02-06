'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useTimePhase } from '@/hooks/useTimePhase';
import { ThemeProvider } from '@/components/ThemeProvider';
import { IftarTimer } from '@/components/IftarTimer';
import { LocationPicker } from '@/components/LocationPicker';
import { PrayerTimesPanel } from '@/components/PrayerTimes';
import { RamadanProgress } from '@/components/RamadanProgress';
import { CityComparison } from '@/components/CityComparison';
import { ShareCard } from '@/components/ShareCard';
import { POPULAR_CITIES } from '@/lib/constants';

export default function Home() {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const {
    location,
    isLoading: isLoadingLocation,
    error: locationError,
    requestLocation,
    setLocation,
  } = useGeolocation();

  // Default to Houston if no location
  const effectiveLocation = location || POPULAR_CITIES[0];

  const { prayerTimes, nextIftar, isIftarToday, isLoading: isLoadingPrayer } = usePrayerTimes({
    lat: effectiveLocation.lat,
    lng: effectiveLocation.lng,
  });

  const { phase } = useTimePhase(prayerTimes);

  // Show location picker on first visit if no saved location
  useEffect(() => {
    if (!location && typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('iftar-has-visited');
      if (!hasVisited) {
        setShowLocationPicker(true);
        localStorage.setItem('iftar-has-visited', 'true');
      }
    }
  }, [location]);

  // Auto-close location picker when location is found via geolocation
  useEffect(() => {
    if (location && showLocationPicker) {
      setShowLocationPicker(false);
    }
  }, [location, showLocationPicker]);

  const handleLocationSelect = (city: typeof effectiveLocation) => {
    setLocation(city);
    setShowLocationPicker(false);
  };

  return (
    <ThemeProvider phase={phase}>
      <main className="min-h-screen min-h-dvh flex flex-col">
        {/* Header */}
        <header className="py-4 px-4 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-medium text-theme-text/80"
          >
            Iftar Timer
          </motion.h1>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="text-sm text-theme-accent hover:underline"
          >
            {showLocationPicker ? 'Close' : 'Change Location'}
          </motion.button>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center py-8 gap-8 md:gap-12">
          <AnimatePresence mode="wait">
            {showLocationPicker ? (
              <motion.div
                key="location-picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex items-center"
              >
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  onRequestGeolocation={requestLocation}
                  isLoadingGeolocation={isLoadingLocation}
                  geolocationError={locationError}
                  currentLocation={location}
                />
              </motion.div>
            ) : (
              <motion.div
                key="timer-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-8 md:gap-12"
              >
                {/* Main Timer */}
                <IftarTimer
                  cityName={effectiveLocation.name}
                  country={effectiveLocation.country}
                  iftarTime={nextIftar}
                  timezone={effectiveLocation.timezone}
                  isIftarToday={isIftarToday}
                />

                {/* Share Button */}
                <div className="flex justify-center">
                  <ShareCard
                    cityName={effectiveLocation.name}
                    country={effectiveLocation.country}
                    iftarTime={nextIftar}
                    timezone={effectiveLocation.timezone}
                  />
                </div>

                {/* Ramadan Progress */}
                <RamadanProgress />

                {/* City Comparison */}
                <CityComparison currentCity={location || effectiveLocation} />

                {/* Prayer Times Panel */}
                <PrayerTimesPanel
                  prayerTimes={prayerTimes}
                  timezone={effectiveLocation.timezone}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="py-4 px-4 text-center">
          <p className="text-xs text-theme-text/40">
            Prayer times calculated using ISNA method
          </p>
        </footer>
      </main>
    </ThemeProvider>
  );
}
