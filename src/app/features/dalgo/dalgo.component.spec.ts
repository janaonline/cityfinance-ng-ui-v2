import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { buildNativeFilters } from './dalgo-filters.util';
import { CITY_FILTER_ID, DASHBOARD_REGISTRY, DashboardType, STATE_FILTER_ID } from './dalgo.config';
import { DalgoComponent } from './dalgo.component';
import { SupersetEmbedHandle, SupersetEmbedService } from './superset-embed.service';

describe('DalgoComponent', () => {
  let fixture: ComponentFixture<DalgoComponent>;
  let embedService: jasmine.SpyObj<SupersetEmbedService>;
  let embedded: jasmine.SpyObj<SupersetEmbedHandle>;
  const dashboardId = DASHBOARD_REGISTRY[DashboardType.RT_MUNICIPAL_FINANCE].id;

  async function create(user: unknown, embed?: () => Promise<SupersetEmbedHandle>): Promise<void> {
    embedded = jasmine.createSpyObj<SupersetEmbedHandle>('SupersetEmbedHandle', ['unmount']);
    embedService = jasmine.createSpyObj<SupersetEmbedService>('SupersetEmbedService', ['embed']);
    embedService.embed.and.callFake(embed ?? (() => Promise.resolve(embedded)));
    await TestBed.configureTestingModule({
      imports: [DalgoComponent],
      providers: [
        {
          provide: AuthService,
          useValue: { waitForAuthReady: () => of({}), getCurrentUserSnapshot: () => user },
        },
        { provide: SupersetEmbedService, useValue: embedService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DalgoComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows an error and embeds nothing when the state name is missing for a State user', async () => {
    await create({ role: 'STATE', name: 'Fc state' });

    expect(fixture.componentInstance.status()).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('state could not be determined');
    expect(embedService.embed).not.toHaveBeenCalled();
  });

  it('shows an error for an unsupported role', async () => {
    await create({ role: 'ADMIN', name: 'Admin' });

    expect(fixture.componentInstance.status()).toBe('error');
    expect(embedService.embed).not.toHaveBeenCalled();
  });

  it('blocks a State user from a state without data', async () => {
    await create({ role: 'STATE', name: 'Fc state', stateName: 'Maharashtra' });

    expect(fixture.componentInstance.status()).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('not available for your state yet');
    expect(embedService.embed).not.toHaveBeenCalled();
  });

  it('MoHUA: shows the full filter bar with nothing pre-applied', async () => {
    await create({ role: 'MoHUA', name: 'MoHUA' });

    expect(embedService.embed).toHaveBeenCalledOnceWith({
      dashboardId,
      mountPoint: jasmine.any(HTMLElement),
      filters: { expanded: true, visible: true },
      nativeFilters: '',
    });
    expect(fixture.componentInstance.status()).toBe('ready');
  });

  it('State: hides the filter bar and pre-applies the state', async () => {
    await create({ role: 'STATE', name: 'Fc state', stateName: 'Telangana' });

    expect(embedService.embed).toHaveBeenCalledOnceWith({
      dashboardId,
      mountPoint: jasmine.any(HTMLElement),
      filters: { expanded: false, visible: false },
      nativeFilters: buildNativeFilters([{ id: STATE_FILTER_ID, column: 'state', value: 'Telangana' }]),
    });
    expect(fixture.componentInstance.status()).toBe('ready');
  });

  it('ULB: hides the filter bar and pre-applies the state and the ULB name', async () => {
    await create({ role: 'ULB', name: 'Greater Hyderabad Municipal Corporation', stateName: 'Telangana' });

    expect(embedService.embed).toHaveBeenCalledOnceWith({
      dashboardId,
      mountPoint: jasmine.any(HTMLElement),
      filters: { expanded: false, visible: false },
      nativeFilters: buildNativeFilters([
        { id: STATE_FILTER_ID, column: 'state', value: 'Telangana' },
        { id: CITY_FILTER_ID, column: 'ulb', value: 'Greater Hyderabad Municipal Corporation' },
      ]),
    });
  });

  it('shows an error when the dashboard cannot be embedded', async () => {
    spyOn(console, 'error');
    await create({ role: 'MoHUA', name: 'MoHUA' }, () => Promise.reject(new Error("Couldn't connect to Superset")));

    expect(fixture.componentInstance.status()).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('could not be loaded');
  });

  it('unmounts the dashboard when the component is destroyed', async () => {
    await create({ role: 'MoHUA', name: 'MoHUA' });

    fixture.destroy();

    expect(embedded.unmount).toHaveBeenCalledTimes(1);
  });
});
