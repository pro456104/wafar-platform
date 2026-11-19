// The date surface: Gregorian, Latin digits, `YYYY-MM-DD`, in Africa/Tripoli
// (ui-contracts.md §6).
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Tripoli',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** One instant as its Tripoli calendar date, `YYYY-MM-DD`. */
export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const parts = formatter.formatToParts(date);
  const pick = (type: string): string =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

/** The first day of the Tripoli month an instant falls in, as `YYYY-MM-DD`. */
export function monthStart(value: Date): string {
  return `${formatDate(value).slice(0, 8)}01`;
}
