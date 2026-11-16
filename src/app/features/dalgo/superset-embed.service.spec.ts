import { TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';

import { SUPERSET_DOMAIN, SupersetEmbedService } from './superset-embed.service';
import { SupersetService } from './superset.service';

/**
 * The mount point is deliberately not attached to the document, so the iframe the SDK creates never
 * loads (no network request) and `embed()` stays pending. The iframe is created synchronously, which
 * is enough to check what the SDK was asked to embed.
 */
describe('SupersetEmbedService', () => {
  let service: SupersetEmbedService;
  let supersetService: jasmine.SpyObj<SupersetService>;
  let mountPoint: HTMLElement;

  beforeEach(() => {
    supersetService = jasmine.createSpyObj<SupersetService>('SupersetService', ['getGuestToken']);
    supersetService.getGuestToken.and.returnValue(NEVER);
    TestBed.configureTestingModule({ providers: [{ provide: SupersetService, useValue: supersetService }] });
    service = TestBed.inject(SupersetEmbedService);
    mountPoint = document.createElement('div');
  });

  function mountedIframeUrl(): URL {
    const iframe = mountPoint.querySelector('iframe');
    expect(iframe).not.toBeNull();
    return new URL(iframe!.src);
  }

  it('embeds the dashboard from the Superset domain and requests its guest token', () => {
    void service.embed({ dashboardId: 'dash-1', mountPoint, filters: { expanded: true } });

    expect(mountedIframeUrl().origin + mountedIframeUrl().pathname).toBe(`${SUPERSET_DOMAIN}/embedded/dash-1`);
    expect(supersetService.getGuestToken).toHaveBeenCalledOnceWith('dash-1');
  });

  it('passes the filter bar state and native filters as URL params', () => {
    void service.embed({
      dashboardId: 'dash-1',
      mountPoint,
      filters: { expanded: false, visible: false },
      nativeFilters: '(F1:(id:F1))',
    });

    const params = mountedIframeUrl().searchParams;
    expect(params.get('uiConfig')).toBe('1');
    expect(params.get('show_filters')).toBe('false');
    expect(params.get('expand_filters')).toBe('false');
    expect(params.get('native_filters')).toBe('(F1:(id:F1))');
  });

  it('leaves Superset defaults when no visibility or native filters are given', () => {
    void service.embed({ dashboardId: 'dash-1', mountPoint, filters: { expanded: true }, nativeFilters: '' });

    const params = mountedIframeUrl().searchParams;
    expect(params.get('expand_filters')).toBe('true');
    expect(params.has('show_filters')).toBeFalse();
    expect(params.has('native_filters')).toBeFalse();
  });

  it('allows top navigation and popups from the sandboxed iframe', () => {
    void service.embed({ dashboardId: 'dash-1', mountPoint, filters: { expanded: true } });

    const sandbox = mountPoint.querySelector('iframe')!.sandbox;
    expect(sandbox.contains('allow-top-navigation')).toBeTrue();
    expect(sandbox.contains('allow-popups-to-escape-sandbox')).toBeTrue();
  });
});
