import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RolesTeamsOverviewComponent } from './roles-teams-overview.component';
import {
  ADC_ROLES_CONFIG,
  STATE_ADC_TEAMS_CONFIG,
  STATE_ROLES_CONFIG,
  MOHUA_ROLES_CONFIG,
  PMU_ROLES_CONFIG,
} from './roles-teams-overview.models';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

describe('RolesTeamsOverviewComponent', () => {
  let component: RolesTeamsOverviewComponent;
  let fixture: ComponentFixture<RolesTeamsOverviewComponent>;
  let httpMock: HttpTestingController;
  const baseUrl = environment.api.url2;

  async function setup(rolesConfig = STATE_ROLES_CONFIG): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, RolesTeamsOverviewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { rolesConfig } } } },
        { provide: AuthService, useValue: { refreshAccessToken: () => ({ pipe: () => ({ subscribe: () => {} }) }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesTeamsOverviewComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock?.verify());

  it('should create with the STATE config', async () => {
    await setup(STATE_ROLES_CONFIG);
    expect(component).toBeTruthy();
    httpMock.expectOne(`${baseUrl}users/permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/state-members`).flush([]);
    httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [] });
  });

  it('should create with the MoHUA config and hit MoHUA-specific endpoints', async () => {
    await setup(MOHUA_ROLES_CONFIG);
    expect(component).toBeTruthy();
    httpMock.expectOne(`${baseUrl}users/mohua-permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/mohua-members`).flush([]);
    httpMock.expectOne(`${baseUrl}users/pmu-members`).flush([]);
  });

  it('falls back to each config\'s defaultSubRole when the stored user has none', async () => {
    await setup(STATE_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/state-members`).flush([]);
    httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [] });
    expect(component.currentSubRole()).toBe('SUBMITTER');
  });

  it('builds member-action URLs from memberActionBasePath (MoHUA prefixes with mohua-members)', async () => {
    await setup(MOHUA_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/mohua-permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/mohua-members`).flush([]);
    httpMock.expectOne(`${baseUrl}users/pmu-members`).flush([]);

    component.confirmDelete({
      _id: 'm1',
      name: 'Test',
      mobile: '9000000000',
      designation: '',
      subRole: 'EDITOR',
      isActive: true,
      isXVIFCProfileVerified: true,
      lastActive: null,
    });
    httpMock.expectOne(`${baseUrl}users/mohua-members/m1`).flush({});
  });

  it('MoHUA page lists the PMU team read-only, and PMU page lists the MoHUA team', async () => {
    await setup(MOHUA_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/mohua-permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/mohua-members`).flush([]);
    httpMock.expectOne(`${baseUrl}users/pmu-members`).flush([
      { _id: 'p1', name: 'Pmu One', mobile: '9000000001', designation: '', subRole: 'EDITOR', isActive: true, isXVIFCProfileVerified: true, lastActive: null },
    ]);

    expect(component.otherTeams()).toEqual([
      jasmine.objectContaining({ title: 'PMU team', status: 'ready', members: [jasmine.objectContaining({ _id: 'p1' })] }),
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pmu One');
  });

  it('keeps the own-team page working when the other team fails to load', async () => {
    await setup(PMU_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/pmu-permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/pmu-members`).flush([]);
    httpMock.expectOne(`${baseUrl}users/mohua-members`).flush('forbidden', { status: 403, statusText: 'Forbidden' });

    expect(component.otherTeams()).toEqual([jasmine.objectContaining({ title: 'MoHUA team', status: 'error' })]);
    expect(component.hasError()).toBeFalse();
  });

  it('shows no extra team for a config without readOnlyTeams', async () => {
    await setup(STATE_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/state-members`).flush([]);
    httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [] });

    expect(component.otherTeams()).toEqual([]);
  });

  it('ADC page hits the ADC endpoints, with no ADC selector and no ?adcId', async () => {
    await setup(ADC_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/adc-permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/adc-members`).flush([]);

    expect(component.adcSelector).toBeFalse();
    expect(component.transferEnabled).toBeTrue();
    expect(component.transferDemotesSelf).toBeTrue();
  });

  it('keeps the Transfer card off for the existing State page', async () => {
    await setup(STATE_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/state-members`).flush([]);
    httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [] });

    expect(component.transferEnabled).toBeFalse();
  });

  describe('"ADC Teams" button on State People and Roles', () => {
    const adcTeamsButton = () => component.actionButtons().find((b) => b.label === 'ADC Teams');

    async function setupStatePage(adcResponse: () => void): Promise<void> {
      await setup(STATE_ROLES_CONFIG);
      httpMock.expectOne(`${baseUrl}users/permission-matrix`).flush([]);
      httpMock.expectOne(`${baseUrl}users/state-members`).flush([]);
      adcResponse();
    }

    it('shows the button beside Add Member when the state has an ADC, and opens the ADC Teams page', async () => {
      await setupStatePage(() =>
        httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [{ _id: 'a1', name: 'ADC One', state: 's1' }] }),
      );
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);

      expect(component.actionButtons().map((b) => b.label)).toEqual(['Permission matrix', 'ADC Teams', 'Add Member']);
      expect(adcTeamsButton()?.disabled).toBeFalse();

      adcTeamsButton()!.onClick();
      expect(router.navigate).toHaveBeenCalledWith(['../adc-teams'], { relativeTo: TestBed.inject(ActivatedRoute) });
    });

    it('hides the button when the state has no ADC', async () => {
      await setupStatePage(() => httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [] }));
      expect(adcTeamsButton()).toBeUndefined();
    });

    it('hides the button, without an error page, when the ADC lookup fails', async () => {
      await setupStatePage(() =>
        httpMock.expectOne(`${baseUrl}master/adc`).flush('boom', { status: 500, statusText: 'Server Error' }),
      );
      expect(adcTeamsButton()).toBeUndefined();
      expect(component.hasError()).toBeFalse();
    });

    it("is not offered on other teams' pages (no ADC lookup)", async () => {
      await setup(ADC_ROLES_CONFIG);
      httpMock.expectOne(`${baseUrl}users/adc-permission-matrix`).flush([]);
      httpMock.expectOne(`${baseUrl}users/adc-members`).flush([]);
      httpMock.expectNone(`${baseUrl}master/adc`);
      expect(adcTeamsButton()).toBeUndefined();
    });
  });

  describe('ADC Teams page (State admin)', () => {
    const member = {
      _id: 'm1',
      name: 'ADC Admin',
      mobile: '9000000000',
      designation: '',
      subRole: 'SUBMITTER',
      isActive: true,
      isXVIFCProfileVerified: true,
      lastActive: null,
    };

    it('links back to People and Roles, since the page has no sidebar entry of its own', async () => {
      await setup(STATE_ADC_TEAMS_CONFIG);
      httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [] });
      fixture.detectChanges();

      const back = (fixture.nativeElement as HTMLElement).querySelector('a[mat-stroked-button]');
      expect(back?.textContent).toContain('Back to People and Roles');
    });

    it('loads only the ADC list until an ADC is picked', async () => {
      await setup(STATE_ADC_TEAMS_CONFIG);
      httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [{ _id: 'a1', name: 'ADC One', state: 's1' }] });

      expect(component.adcs().length).toBe(1);
      expect(component.isLoading()).toBeFalse();
      httpMock.expectNone((r) => r.url.includes('users/adc-'));
    });

    it('sends the picked ADC as ?adcId on the members and matrix calls, and on member actions', async () => {
      await setup(STATE_ADC_TEAMS_CONFIG);
      httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [{ _id: 'a1', name: 'ADC One', state: 's1' }] });

      component.onAdcChange('a1');
      httpMock.expectOne(`${baseUrl}users/adc-members?adcId=a1`).flush([member]);
      httpMock.expectOne(`${baseUrl}users/adc-permission-matrix?adcId=a1`).flush([]);

      component.confirmDelete({ ...member, _id: 'm2', subRole: 'VIEWER' } as never);
      httpMock.expectOne(`${baseUrl}users/adc-members/m2?adcId=a1`).flush({});
    });

    it('does not demote the State admin on transfer — their own role is unchanged', async () => {
      await setup(STATE_ADC_TEAMS_CONFIG);
      httpMock.expectOne(`${baseUrl}master/adc`).flush({ data: [{ _id: 'a1', name: 'ADC One', state: 's1' }] });
      component.onAdcChange('a1');
      httpMock.expectOne(`${baseUrl}users/adc-members?adcId=a1`).flush([member]);
      httpMock.expectOne(`${baseUrl}users/adc-permission-matrix?adcId=a1`).flush([]);
      const before = component.currentSubRole();

      component.transferTargetId.set('m2');
      component.confirmTransfer();
      httpMock.expectOne(`${baseUrl}users/adc-members/transfer-submitter?adcId=a1`).flush({});
      httpMock.expectOne(`${baseUrl}users/adc-members?adcId=a1`).flush([member]);

      expect(component.currentSubRole()).toBe(before);
    });
  });
});
