import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { SupersetEmbedHandle, SupersetEmbedService } from '../superset-embed.service';
import { PUBLIC_DASHBOARD_REGISTRY, PublicDashboardType } from './dalgo-public.config';
import { DalgoPublicComponent } from './dalgo-public.component';

describe('DalgoPublicComponent', () => {
  let fixture: ComponentFixture<DalgoPublicComponent>;
  let embedService: jasmine.SpyObj<SupersetEmbedService>;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const flush = () => new Promise<void>((resolve) => setTimeout(resolve));
  const handle = (): jasmine.SpyObj<SupersetEmbedHandle> =>
    jasmine.createSpyObj<SupersetEmbedHandle>('SupersetEmbedHandle', ['unmount']);

  async function create(pageType: string, embed?: () => Promise<SupersetEmbedHandle>): Promise<void> {
    embedService = jasmine.createSpyObj<SupersetEmbedService>('SupersetEmbedService', ['embed']);
    embedService.embed.and.callFake(embed ?? (() => Promise.resolve(handle())));
    params = new BehaviorSubject(convertToParamMap({ pageType }));

    await TestBed.configureTestingModule({
      imports: [DalgoPublicComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: SupersetEmbedService, useValue: embedService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DalgoPublicComponent);
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
  }

  afterEach(() => fixture?.destroy());

  it('shows an error and embeds nothing for an unknown page type', async () => {
    await create('not_a_dashboard');

    expect(fixture.componentInstance.status()).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('Dashboard not found');
    expect(embedService.embed).not.toHaveBeenCalled();
  });

  it('embeds the matching dashboard with the full filter bar and no pre-applied filters', async () => {
    await create(PublicDashboardType.AP_DASHBOARD);

    expect(embedService.embed).toHaveBeenCalledOnceWith({
      dashboardId: PUBLIC_DASHBOARD_REGISTRY[PublicDashboardType.AP_DASHBOARD].id,
      mountPoint: jasmine.any(HTMLElement),
      filters: { expanded: true },
    });
    expect(fixture.componentInstance.status()).toBe('ready');
  });

  it('shows an error when the dashboard cannot be embedded', async () => {
    spyOn(console, 'error');
    await create(PublicDashboardType.MARKET_READINESS, () => Promise.reject(new Error("Couldn't connect to Superset")));

    expect(fixture.componentInstance.status()).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('could not be loaded');
  });

  it('unmounts the previous dashboard and embeds the new one when the page type changes', async () => {
    const first = handle();
    const second = handle();
    const queue = [first, second];
    await create(PublicDashboardType.AP_DASHBOARD, () => Promise.resolve(queue.shift()!));

    params.next(convertToParamMap({ pageType: PublicDashboardType.MARKET_READINESS }));
    await flush();

    expect(first.unmount).toHaveBeenCalledTimes(1);
    expect(second.unmount).not.toHaveBeenCalled();
    expect(embedService.embed).toHaveBeenCalledTimes(2);
    expect(embedService.embed.calls.mostRecent().args[0].dashboardId).toBe(
      PUBLIC_DASHBOARD_REGISTRY[PublicDashboardType.MARKET_READINESS].id,
    );
  });

  it('ignores a slow embed of a previous page type once a newer one was requested', async () => {
    const slow = handle();
    const fast = handle();
    let resolveSlow!: (h: SupersetEmbedHandle) => void;
    const pending = [
      new Promise<SupersetEmbedHandle>((resolve) => (resolveSlow = resolve)),
      Promise.resolve<SupersetEmbedHandle>(fast),
    ];
    await create(PublicDashboardType.AP_DASHBOARD, () => pending.shift()!);

    params.next(convertToParamMap({ pageType: PublicDashboardType.MARKET_READINESS }));
    await flush();
    resolveSlow(slow);
    await flush();

    // The newer iframe replaced the older one, so unmounting the stale embed would wipe the new one.
    expect(slow.unmount).not.toHaveBeenCalled();
    expect(fast.unmount).not.toHaveBeenCalled();
    expect(fixture.componentInstance.status()).toBe('ready');

    fixture.destroy();
    expect(fast.unmount).toHaveBeenCalledTimes(1);
  });

  it('unmounts an embed that finishes after the component was destroyed', async () => {
    const late = handle();
    let resolveLate!: (h: SupersetEmbedHandle) => void;
    await create(PublicDashboardType.AP_DASHBOARD, () => new Promise((resolve) => (resolveLate = resolve)));

    fixture.destroy();
    resolveLate(late);
    await flush();

    expect(late.unmount).toHaveBeenCalledTimes(1);
  });
});
