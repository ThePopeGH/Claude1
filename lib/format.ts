import { formatInTimeZone } from 'date-fns-tz';

export const TZ = 'Europe/Vienna';

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function formatDate(date: Date): string {
  return formatInTimeZone(date, TZ, 'dd.MM.yyyy HH:mm');
}
