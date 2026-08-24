import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RolesTeamsOverviewComponent } from './roles-teams-overview.component';
import { STATE_ROLES_CONFIG, MOHUA_ROLES_CONFIG } from './roles-teams-overview.models';
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
  });

  it('should create with the MoHUA config and hit MoHUA-specific endpoints', async () => {
    await setup(MOHUA_ROLES_CONFIG);
    expect(component).toBeTruthy();
    httpMock.expectOne(`${baseUrl}users/mohua-permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/mohua-members`).flush([]);
  });

  it('falls back to each config\'s defaultSubRole when the stored user has none', async () => {
    await setup(STATE_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/state-members`).flush([]);
    expect(component.currentSubRole()).toBe('SUBMITTER');
  });

  it('builds member-action URLs from memberActionBasePath (MoHUA prefixes with mohua-members)', async () => {
    await setup(MOHUA_ROLES_CONFIG);
    httpMock.expectOne(`${baseUrl}users/mohua-permission-matrix`).flush([]);
    httpMock.expectOne(`${baseUrl}users/mohua-members`).flush([]);

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
});
