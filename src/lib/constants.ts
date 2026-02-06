// Time phases for dynamic theming
export type TimePhase =
  | 'morning'      // Fajr to Noon
  | 'afternoon'    // Noon to 3 hours before iftar
  | 'preIftar'     // 3 hours to 30 mins before
  | 'nearIftar'    // 30 mins before to iftar
  | 'afterIftar'   // Iftar to midnight
  | 'lateNight';   // Midnight to Fajr

export const TIME_PHASES = {
  morning: {
    bg: '#F5F1E8',
    bgGradient: null,
    text: '#2C2C2C',
    textMuted: 'rgba(44, 44, 44, 0.7)',
    accent: '#D4AF37',
    description: 'Morning light, fresh start'
  },
  afternoon: {
    bg: '#E8EDF2',
    bgGradient: null,
    text: '#1A365D',
    textMuted: 'rgba(26, 54, 93, 0.7)',
    accent: '#0D7377',
    description: 'The longest part of the fast, calm endurance'
  },
  preIftar: {
    bg: '#FFE4D6',
    bgGradient: 'linear-gradient(135deg, #FFE4D6 0%, #FFD4B8 100%)',
    text: '#4A2C2A',
    textMuted: 'rgba(74, 44, 42, 0.7)',
    accent: '#E86A33',
    description: 'Sunset approaching, anticipation building'
  },
  nearIftar: {
    bg: '#2D1B69',
    bgGradient: 'linear-gradient(135deg, #2D1B69 0%, #1A1A3E 100%)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    accent: '#FFD700',
    description: 'Twilight, almost there, magical hour'
  },
  afterIftar: {
    bg: '#0F1419',
    bgGradient: null,
    text: '#F0F0F0',
    textMuted: 'rgba(240, 240, 240, 0.7)',
    accent: '#4ECDC4',
    description: 'Night prayer, peaceful reflection'
  },
  lateNight: {
    bg: '#0A0E14',
    bgGradient: null,
    text: '#D0D0D0',
    textMuted: 'rgba(208, 208, 208, 0.7)',
    accent: '#A78BFA',
    description: 'Deep night, tahajjud time'
  }
} as const;

// Popular cities with hardcoded coordinates (zero API calls)
export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const POPULAR_CITIES: City[] = [
  { name: 'Houston', country: 'USA', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago' },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Mecca', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh' },
];

// Calculation methods supported by Adhan.js
export const CALCULATION_METHODS = [
  { id: 'ISNA', name: 'Islamic Society of North America', description: 'Common in US/Canada' },
  { id: 'MuslimWorldLeague', name: 'Muslim World League', description: 'Widely used internationally' },
  { id: 'Egyptian', name: 'Egyptian General Authority', description: 'Used in Egypt and Africa' },
  { id: 'UmmAlQura', name: 'Umm al-Qura University', description: 'Used in Saudi Arabia' },
  { id: 'Karachi', name: 'University of Islamic Sciences, Karachi', description: 'Common in Pakistan' },
] as const;

// Ramadan 2026 dates (approximation - actual dates depend on moon sighting)
// Ramadan 1447 AH is expected around February 18, 2026 to March 19, 2026
export const RAMADAN_2026 = {
  startDate: new Date('2026-02-18'),
  endDate: new Date('2026-03-19'),
  hijriYear: 1447,
};

// Local storage keys
export const STORAGE_KEYS = {
  LOCATION: 'iftar-location',
  CALCULATION_METHOD: 'iftar-calc-method',
  THEME_OVERRIDE: 'iftar-theme-override',
} as const;
