export function toIsoWeek(d: Date): string {
  const year = d.getUTCFullYear();
  const dayOfYear = Math.ceil(
    (+d - Date.UTC(year, 0, 1)) / 86_400_000 + (new Date(Date.UTC(year, 0, 1)).getUTCDay() || 7),
  );
  const week = 'W' + Math.ceil(dayOfYear / 7);
  return `${year}-${week}`;
}

export function toYYYYMM(d: Date): string {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}
