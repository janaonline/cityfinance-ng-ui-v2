import { InjectionToken, Provider, inject } from '@angular/core';
import {
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
  MatAutocompleteDefaultOptions,
} from '@angular/material/autocomplete';
import { MAT_MENU_DEFAULT_OPTIONS, MatMenuDefaultOptions } from '@angular/material/menu';
import { MAT_SELECT_CONFIG, MatSelectConfig } from '@angular/material/select';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';

/** Fallback defaults used when no parent Material menu configuration exists. */
const DEFAULT_MENU_OPTIONS: MatMenuDefaultOptions = {
  xPosition: 'after',
  yPosition: 'below',
  overlapTrigger: false,
  backdropClass: 'cdk-overlay-transparent-backdrop',
};

/** Fallback defaults used when no parent Material tooltip configuration exists. */
const DEFAULT_TOOLTIP_OPTIONS: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 1500,
};

/**
 * DI token that stores the active Material theme class for the current scope.
 *
 * Example value: 'xvifc-theme'
 */
export const MATERIAL_THEME_CLASS = new InjectionToken<string>('MATERIAL_THEME_CLASS');

/**
 * Provides a scoped Angular Material overlay theme configuration.
 *
 * This utility ensures overlay-based Material components receive the supplied
 * theme class so they can be styled consistently with the hosting module or
 * feature theme.
 *
 * The returned providers merge with any parent Material defaults instead of
 * replacing them entirely, which keeps existing configuration intact while
 * adding theme-specific panel classes.
 *
 * Components covered here:
 * - mat-select
 * - mat-autocomplete
 * - mat-menu
 * - mat-tooltip
 *
 * @param themeClass CSS class applied to Material overlay content in this scope
 * @returns Provider array to register in a component, route, or feature scope
 */
export function provideMaterialThemeScope(themeClass: string): Provider[] {
  return [
    /** Exposes the active theme class for reuse within the same DI scope. */
    { provide: MATERIAL_THEME_CLASS, useValue: themeClass },

    /**
     * Applies the theme class to mat-select overlay panels while preserving any
     * parent select configuration already defined higher in the injector tree.
     */
    {
      provide: MAT_SELECT_CONFIG,
      useFactory: (): MatSelectConfig => {
        const parentConfig = inject(MAT_SELECT_CONFIG, { optional: true, skipSelf: true }) ?? {};

        return {
          ...parentConfig,
          overlayPanelClass: themeClass,
        };
      },
    },

    /**
     * Applies the theme class to mat-autocomplete overlay panels while preserving
     * any parent autocomplete defaults from an outer injector scope.
     */
    {
      provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
      useFactory: (): MatAutocompleteDefaultOptions => {
        const parentDefaults =
          inject(MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, {
            optional: true,
            skipSelf: true,
          }) ?? {};

        return {
          ...parentDefaults,
          overlayPanelClass: themeClass,
        };
      },
    },

    /**
     * Applies the theme class to mat-menu overlay panels while preserving parent
     * defaults when present, or falling back to module-safe defaults otherwise.
     */
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useFactory: (): MatMenuDefaultOptions => {
        const parentDefaults =
          inject(MAT_MENU_DEFAULT_OPTIONS, {
            optional: true,
            skipSelf: true,
          }) ?? DEFAULT_MENU_OPTIONS;

        return {
          ...parentDefaults,
          overlayPanelClass: themeClass,
        };
      },
    },

    /**
     * Applies the theme class to tooltips while preserving parent tooltip
     * defaults when available, or using fallback defaults otherwise.
     */
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useFactory: (): MatTooltipDefaultOptions => {
        const parentDefaults =
          inject(MAT_TOOLTIP_DEFAULT_OPTIONS, {
            optional: true,
            skipSelf: true,
          }) ?? DEFAULT_TOOLTIP_OPTIONS;

        return {
          ...parentDefaults,
          tooltipClass: themeClass,
        };
      },
    },
  ];
}
