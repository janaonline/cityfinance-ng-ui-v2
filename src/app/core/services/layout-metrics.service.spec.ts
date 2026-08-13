import { DestroyRef, ElementRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LayoutMetricsService } from './layout-metrics.service';

function createElementRef(height: number): ElementRef<HTMLElement> {
  const element = document.createElement('div');
  spyOn(element, 'getBoundingClientRect').and.returnValue({ height } as unknown as DOMRect);
  return new ElementRef(element);
}

describe('LayoutMetricsService', () => {
  let service: LayoutMetricsService;
  // Every tracker's teardown, collected per-test so a stray ResizeObserver never survives past
  // the test that created it — an undisconnected observer on a detached element can fire
  // asynchronously in a *later* test (after Jasmine auto-restores that test's spies), setting
  // the CSS var to a stale value and making that later test flaky.
  let pendingTeardowns: Array<() => void>;

  /** Duck-typed DestroyRef double — captures the registered callback so tests can fire it manually. */
  function createDestroyRef(): { destroyRef: DestroyRef; triggerDestroy: () => void } {
    let callback: (() => void) | undefined;
    const destroyRef = {
      onDestroy: (cb: () => void) => {
        callback = cb;
        return () => undefined;
      },
    } as unknown as DestroyRef;
    const triggerDestroy = () => callback?.();
    pendingTeardowns.push(triggerDestroy);
    return { destroyRef, triggerDestroy };
  }

  beforeEach(() => {
    pendingTeardowns = [];
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutMetricsService);
  });

  afterEach(() => {
    pendingTeardowns.forEach((triggerDestroy) => triggerDestroy());
    document.documentElement.style.removeProperty('--app-header-height');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('measures the element synchronously and sets the signal + CSS variable', () => {
    const elementRef = createElementRef(123.4);
    const { destroyRef } = createDestroyRef();

    service.trackHeaderElement(elementRef, destroyRef);

    expect(service.headerHeightPx()).toBe(123);
    expect(document.documentElement.style.getPropertyValue('--app-header-height')).toBe('123px');
  });

  it('disconnects the ResizeObserver when the owning DestroyRef is destroyed', () => {
    const elementRef = createElementRef(80);
    const { destroyRef, triggerDestroy } = createDestroyRef();
    const disconnectSpy = spyOn(ResizeObserver.prototype, 'disconnect').and.callThrough();

    service.trackHeaderElement(elementRef, destroyRef);
    triggerDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('does nothing on the server (non-browser platform)', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const serverService = TestBed.inject(LayoutMetricsService);
    const elementRef = createElementRef(999);
    const { destroyRef } = createDestroyRef();

    serverService.trackHeaderElement(elementRef, destroyRef);

    expect(serverService.headerHeightPx()).toBe(0);
    expect(document.documentElement.style.getPropertyValue('--app-header-height')).toBe('');
  });
});
