import i18n from 'i18next';

/** Locale-aware formatting helpers. Always prefer these over manual string building. */

export function formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(i18n.language, options ?? { dateStyle: 'medium' }).format(value);
}

export function formatDateTime(value: Date | number): string {
  return new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export function formatRelativeTime(value: Date | number): string {
  const target = typeof value === 'number' ? value : value.getTime();
  const deltaSeconds = Math.round((target - Date.now()) / 1000);

  const thresholds: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.34524],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ];

  const formatter = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
  let duration = deltaSeconds;

  for (const [unit, amount] of thresholds) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit);
    }
    duration /= amount;
  }

  return formatter.format(Math.round(duration), 'year');
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(i18n.language, options).format(value);
}

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(value);
}

/** Cents to a display string, the way payment providers store amounts. */
export function formatMinorUnits(amountInMinorUnits: number, currency: string): string {
  return formatCurrency(amountInMinorUnits / 100, currency);
}
