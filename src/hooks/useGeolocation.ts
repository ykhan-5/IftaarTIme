'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { City, STORAGE_KEYS } from '@/lib/constants';
import { reverseGeocode } from '@/lib/geocoding';

interface UseGeolocationResult {
  location: City | null;
  isLoading: boolean;
  error: string | null;
  justFoundLocation: boolean; // True when location was just found via GPS
  requestLocation: () => Promise<void>;
  setLocation: (city: City) => void;
  clearLocation: () => void;
  clearJustFound: () => void;
}

export function useGeolocation(): UseGeolocationResult {
  // Start with null to avoid hydration mismatch
  const [location, setLocationState] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justFoundLocation, setJustFoundLocation] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (hasLoadedFromStorage.current) return;
    hasLoadedFromStorage.current = true;

    const stored = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (stored) {
      try {
        setLocationState(JSON.parse(stored));
      } catch {
        // Invalid stored data, ignore
      }
    }
  }, []);

  const setLocation = useCallback((city: City) => {
    setLocationState(city);
    setError(null);
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(city));
  }, []);

  const clearLocation = useCallback(() => {
    setLocationState(null);
    localStorage.removeItem(STORAGE_KEYS.LOCATION);
  }, []);

  const clearJustFound = useCallback(() => {
    setJustFoundLocation(false);
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);
    setJustFoundLocation(false);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city name
      const city = await reverseGeocode(latitude, longitude);

      if (city) {
        setLocation(city);
      } else {
        // Fallback: use coordinates without city name
        setLocation({
          name: 'Current Location',
          country: '',
          lat: latitude,
          lng: longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }

      // Mark that we just found location via GPS
      setJustFoundLocation(true);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred.');
        }
      } else {
        setError('Failed to get location');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  return {
    location,
    isLoading,
    error,
    justFoundLocation,
    requestLocation,
    setLocation,
    clearLocation,
    clearJustFound,
  };
}
