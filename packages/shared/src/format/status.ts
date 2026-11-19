// The processing-status vocabulary: the four Arabic labels FR-044 fixes, read
// by every surface that shows a status (ui-contracts.md §6).
import type { CatalogStatus } from '../contracts/catalogs.ts';

export const statusLabels: Record<CatalogStatus, string> = {
  uploaded: 'تم الرفع',
  processing: 'قيد المعالجة',
  completed: 'اكتمل',
  failed: 'فشل',
};

/** The registered status label; an unknown value never reaches a page. */
export function formatStatus(status: CatalogStatus): string {
  return statusLabels[status];
}
