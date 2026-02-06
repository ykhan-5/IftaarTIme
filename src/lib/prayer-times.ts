import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  CalculationParameters,
} from 'adhan';
import { DateTime } from 'luxon';

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date; // Iftar time
  isha: Date;
  // Computed values
  iftarTime: Date;
  suhoorEnd: Date; // Same as Fajr
}

export type CalculationMethodId =
  | 'ISNA'
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'UmmAlQura'
  | 'Karachi';

function getCalculationParams(method: CalculationMethodId): CalculationParameters {
  switch (method) {
    case 'ISNA':
      return CalculationMethod.NorthAmerica();
    case 'MuslimWorldLeague':
      return CalculationMethod.MuslimWorldLeague();
    case 'Egyptian':
      return CalculationMethod.Egyptian();
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura();
    case 'Karachi':
      return CalculationMethod.Karachi();
    default:
      return CalculationMethod.NorthAmerica();
  }
}

export function calculatePrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date(),
  method: CalculationMethodId = 'ISNA'
): PrayerTimesResult {
  const coordinates = new Coordinates(lat, lng);
  const params = getCalculationParams(method);
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    iftarTime: prayerTimes.maghrib, // Iftar is at Maghrib
    suhoorEnd: prayerTimes.fajr, // Suhoor ends at Fajr
  };
}

export function formatTime(date: Date, timezone: string): string {
  return DateTime.fromJSDate(date)
    .setZone(timezone)
    .toFormat('h:mm a');
}

export function formatTimeWithSeconds(date: Date, timezone: string): string {
  return DateTime.fromJSDate(date)
    .setZone(timezone)
    .toFormat('h:mm:ss a');
}

export function getTimeUntilIftar(
  iftarTime: Date,
  now: Date = new Date()
): { hours: number; minutes: number; seconds: number; totalMs: number; isPast: boolean } {
  const diff = iftarTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPast: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, totalMs: diff, isPast: false };
}

export function getNextIftarTime(
  lat: number,
  lng: number,
  method: CalculationMethodId = 'ISNA'
): { iftarTime: Date; isToday: boolean } {
  const now = new Date();
  const todayTimes = calculatePrayerTimes(lat, lng, now, method);

  // If today's iftar hasn't passed, return today's
  if (now < todayTimes.iftarTime) {
    return { iftarTime: todayTimes.iftarTime, isToday: true };
  }

  // Otherwise, get tomorrow's iftar
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = calculatePrayerTimes(lat, lng, tomorrow, method);

  return { iftarTime: tomorrowTimes.iftarTime, isToday: false };
}
