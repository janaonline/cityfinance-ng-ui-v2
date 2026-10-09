import { ActivatedRouteSnapshot } from '@angular/router';

/** The year id (and similar) lives on an ancestor route (/xvifc/:yearId/...), so walk up until a route carries the param. */
export function findRouteParam(snapshot: ActivatedRouteSnapshot, name: string): string {
  for (let current: ActivatedRouteSnapshot | null = snapshot; current; current = current.parent) {
    const value = current.paramMap.get(name);
    if (value) return value;
  }
  return '';
}
