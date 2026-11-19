// The guest's return target: only a path the one route map registers is usable,
// so an external or unknown target is refused before it reaches navigation
// (T023; contracts/ui-contracts.md §1).
import { bareRoutes, shellRoutes, staticRoutes } from '@wafar/shared';

export function internalReturnTarget(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const known: string[] = [
    ...Object.values(shellRoutes),
    ...Object.values(bareRoutes),
    ...Object.values(staticRoutes),
  ];
  const path = value.split('?')[0] ?? '';
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return known.includes(value) || known.includes(path) ? value : null;
}
