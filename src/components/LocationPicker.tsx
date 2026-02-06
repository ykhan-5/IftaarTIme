'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader2, X } from 'lucide-react';
import { City, POPULAR_CITIES } from '@/lib/constants';
import { searchCities } from '@/lib/geocoding';

interface LocationPickerProps {
  onLocationSelect: (city: City) => void;
  onRequestGeolocation: () => void;
  isLoadingGeolocation: boolean;
  geolocationError: string | null;
  currentLocation: City | null;
}

export function LocationPicker({
  onLocationSelect,
  onRequestGeolocation,
  isLoadingGeolocation,
  geolocationError,
  currentLocation,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = useCallback(
    (city: City) => {
      onLocationSelect(city);
      setSearchQuery('');
      setShowDropdown(false);
    },
    [onLocationSelect]
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-6">
      {/* Use My Location Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRequestGeolocation}
        disabled={isLoadingGeolocation}
        className="w-full py-4 px-6 rounded-2xl bg-theme-accent/20 hover:bg-theme-accent/30
                   border-2 border-theme-accent/50 text-theme-text font-medium text-lg
                   flex items-center justify-center gap-3 transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingGeolocation ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Finding you...</span>
          </>
        ) : (
          <>
            <MapPin className="w-6 h-6" />
            <span>Use My Location</span>
          </>
        )}
      </motion.button>

      {/* Geolocation Error */}
      <AnimatePresence>
        {geolocationError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-red-500 text-sm"
          >
            {geolocationError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Current Location Display */}
      <AnimatePresence>
        {currentLocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center gap-2 text-theme-accent text-sm"
          >
            <MapPin className="w-4 h-4" />
            <span>
              Using {currentLocation.name}
              {currentLocation.country && `, ${currentLocation.country}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-theme-text/20" />
        <span className="text-theme-text/50 text-sm uppercase tracking-wider">or search</span>
        <div className="flex-1 h-px bg-theme-text/20" />
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any city... (e.g., London, Dubai, Jakarta)"
            className="w-full h-14 pl-12 pr-12 rounded-xl bg-theme-bg/50
                       border-2 border-theme-text/20 focus:border-theme-accent
                       text-theme-text placeholder:text-theme-text/40
                       text-lg outline-none transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1
                         hover:bg-theme-text/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-theme-text/50" />
            </button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5
                                text-theme-accent animate-spin" />
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 py-2
                         bg-white dark:bg-gray-900 rounded-xl shadow-xl
                         border border-theme-text/10 z-50 max-h-64 overflow-y-auto"
            >
              {searchResults.map((city, index) => (
                <button
                  key={`${city.name}-${city.lat}-${index}`}
                  onClick={() => handleCitySelect(city)}
                  className="w-full px-4 py-3 text-left hover:bg-theme-accent/10
                             flex items-center gap-3 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-theme-accent flex-shrink-0" />
                  <div>
                    <span className="text-theme-text font-medium">{city.name}</span>
                    {city.country && (
                      <span className="text-theme-text/60 ml-1">, {city.country}</span>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popular Cities */}
      <div className="space-y-3">
        <p className="text-center text-theme-text/50 text-sm uppercase tracking-wider">
          Popular Cities
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_CITIES.slice(0, 10).map((city) => (
            <motion.button
              key={city.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCitySelect(city)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  currentLocation?.name === city.name
                    ? 'bg-theme-accent text-white'
                    : 'bg-theme-text/10 text-theme-text hover:bg-theme-accent/20'
                }`}
            >
              {city.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
