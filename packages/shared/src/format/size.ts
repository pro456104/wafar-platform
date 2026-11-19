// The size surface: integer KB under 1 MB, MB with one Latin decimal at and
// over it (ui-contracts.md §6).
const megabyte = 1024 * 1024;

export function formatSize(byteSize: number): string {
  if (byteSize < megabyte) {
    const kilobytes = Math.max(1, Math.round(byteSize / 1024));
    return `${kilobytes} KB`;
  }
  const megabytes = byteSize / megabyte;
  return `${megabytes.toFixed(1)} MB`;
}
