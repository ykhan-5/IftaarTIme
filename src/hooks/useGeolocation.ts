'use client';

import { useState, useCallback } from 'react';
import { City, STORAGE_KEYS } from '@/lib/constants';
import { reverseGeocode } from '@/lib/geocoding';

interface UseGeolocationResult {
  location: City | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  setLocation: (city: City) => void;
  clearLocation: () => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocationState] = useState<City | null>(() => {
    // Try to load from localStorage on init
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATION);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLocation = useCallback((city: City) => {
    setLocationState(city);
    setError(null);
    // Cache in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(city));
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocationState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.LOCATION);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

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
    requestLocation,
    setLocation,
    clearLocation,
  };
}
