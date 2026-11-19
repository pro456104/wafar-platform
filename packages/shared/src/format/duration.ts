// The duration surface: the four Arabic agreement classes of
// ui-contracts.md §4.6, for the attempt bound's wait.
export function formatDuration(seconds: number): string {
  if (seconds === 1) return 'ثانية واحدة';
  if (seconds === 2) return 'ثانيتين';
  if (seconds >= 3 && seconds <= 10) return `${seconds} ثوان`;
  return `${seconds} ثانية`;
}
