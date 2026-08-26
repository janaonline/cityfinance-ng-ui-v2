/**
 * Feature-scoped Material theme class for the whole XVI-FC module tree
 * (`/xvifc/:yearId/**`, covering the ulb/state/mohua/admin sub-modules).
 *
 * Kept in its own file, separate from `xvi-fc-module.component.ts`, so route configs
 * (`xvi-fc-module.routes.ts`) can import it without a static import dragging the lazily
 * loaded `XviFcModuleComponent` into an eager bundle.
 */
export const XVIFC_THEME_CLASS = 'xvifc-theme';
