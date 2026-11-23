import { Location } from '@angular/common';
import { Router, UrlTree } from '@angular/router';

/** Where a page opened from the ULB Eligibility page should send its back link. */
export interface EligibilityReturn {
  /** That page's URL, filters included; null when the page was not opened from it. */
  link: UrlTree | null;
  /** It is the entry just before this one, so going back in history returns there without adding a step. */
  viaHistory: boolean;
}

/**
 * Reads the `ulbEligibilityUrl` the ULB Eligibility page passes as navigation state on its ULB and Batch links. Call
 * it while the page is being created: a reload or Back restores the state from `history.state`. Only an in-app URL of
 * that page is accepted.
 */
export function readEligibilityReturn(router: Router, location: Location): EligibilityReturn {
  const navigation = router.getCurrentNavigation();
  const state = (navigation?.extras.state ?? location.getState()) as { ulbEligibilityUrl?: unknown } | null;
  const url = state?.ulbEligibilityUrl;
  if (typeof url !== 'string' || !url.startsWith('/') || !url.includes('/ulb-eligibility')) {
    return { link: null, viaHistory: false };
  }
  const previous = navigation?.previousNavigation?.finalUrl;
  return { link: router.parseUrl(url), viaHistory: !!previous && router.serializeUrl(previous) === url };
}
