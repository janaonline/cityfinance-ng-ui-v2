import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { XvifcModuleService } from '../../xvi-fc-module/xvi-fc-module.service';
import { buildXvifcFeatureLink, XvifcYearId } from '../../xvi-fc-module/xvi-fc-side-menu.config';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let mockXvifcService: jasmine.SpyObj<XvifcModuleService>;

  const mockAvailableYearIds: XvifcYearId[] = ['2024-25', '2025-26'] as unknown as XvifcYearId[];

  beforeEach(async () => {
    mockXvifcService = jasmine.createSpyObj<XvifcModuleService>(
      'XvifcModuleService',
      ['clearResolvedContext'],
      {
        availableYearIds: mockAvailableYearIds,
      },
    );

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([]), { provide: XvifcModuleService, useValue: mockXvifcService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call clearResolvedContext on init', () => {
    fixture.detectChanges(); // triggers ngOnInit
    expect(mockXvifcService.clearResolvedContext).toHaveBeenCalledTimes(1);
  });

  it('should initialize selectedYearId as null', () => {
    expect(component['selectedYearId']()).toBeNull();
  });

  it('should expose availableYearIds from the service', () => {
    expect(component['availableYearIds']).toEqual(mockAvailableYearIds);
  });

  it('should return 4 role options initially', () => {
    const roleOptions = component['roleOptions']();
    expect(roleOptions.length).toBe(4);
  });

  it('should disable ULB, STATE, and MOHUA when no year is selected', () => {
    const roleOptions = component['roleOptions']();

    const ulb = roleOptions.find((x) => x.label === 'ULB');
    const state = roleOptions.find((x) => x.label === 'STATE');
    const mohua = roleOptions.find((x) => x.label === 'MOHUA');

    expect(ulb?.isDisabled).toBeTrue();
    expect(state?.isDisabled).toBeTrue();
    expect(mohua?.isDisabled).toBeTrue();
  });

  it('should keep DOE disabled and inactive initially', () => {
    const doe = component['roleOptions']().find((x) => x.label === 'DOE');

    expect(doe).toBeDefined();
    expect(doe?.isDisabled).toBeTrue();
    expect(doe?.isActive).toBeFalse();
    expect(doe?.routerLink).toBeNull();
  });

  it('should have null routerLink for ULB, STATE, and MOHUA when no year is selected', () => {
    const roleOptions = component['roleOptions']();

    expect(roleOptions.find((x) => x.label === 'ULB')?.routerLink).toBeNull();
    expect(roleOptions.find((x) => x.label === 'STATE')?.routerLink).toBeNull();
    expect(roleOptions.find((x) => x.label === 'MOHUA')?.routerLink).toBeNull();
  });

  it('should set selectedYearId for a valid year', () => {
    component['updateSelectedYear']('2024-25');
    expect(component['selectedYearId']()).toBe('2024-25' as XvifcYearId);
  });

  it('should enable ULB, STATE, and MOHUA when a valid year is selected', () => {
    component['updateSelectedYear']('2024-25');

    const roleOptions = component['roleOptions']();
    expect(roleOptions.find((x) => x.label === 'ULB')?.isDisabled).toBeFalse();
    expect(roleOptions.find((x) => x.label === 'STATE')?.isDisabled).toBeFalse();
    expect(roleOptions.find((x) => x.label === 'MOHUA')?.isDisabled).toBeFalse();
  });

  it('should keep DOE disabled even when a valid year is selected', () => {
    component['updateSelectedYear']('2024-25');

    const doe = component['roleOptions']().find((x) => x.label === 'DOE');
    expect(doe?.isDisabled).toBeTrue();
    expect(doe?.routerLink).toBeNull();
  });

  it('should generate correct routerLink for ULB when a valid year is selected', () => {
    component['updateSelectedYear']('2024-25');

    const ulb = component['roleOptions']().find((x) => x.label === 'ULB');
    expect(ulb?.routerLink).toEqual(
      buildXvifcFeatureLink('ULB', '2024-25' as XvifcYearId, 'overview'),
    );
  });

  it('should generate correct routerLink for STATE when a valid year is selected', () => {
    component['updateSelectedYear']('2024-25');

    const state = component['roleOptions']().find((x) => x.label === 'STATE');
    expect(state?.routerLink).toEqual(
      buildXvifcFeatureLink('STATE', '2024-25' as XvifcYearId, 'overview'),
    );
  });

  it('should generate correct routerLink for MOHUA when a valid year is selected', () => {
    component['updateSelectedYear']('2024-25');

    const mohua = component['roleOptions']().find((x) => x.label === 'MOHUA');
    expect(mohua?.routerLink).toEqual(buildXvifcFeatureLink('MOHUA', '2024-25' as XvifcYearId));
  });

  it('should set selectedYearId to null for an invalid year', () => {
    component['updateSelectedYear']('invalid-year');
    expect(component['selectedYearId']()).toBeNull();
  });

  it('should keep all selectable roles disabled after invalid year selection', () => {
    component['updateSelectedYear']('invalid-year');

    const roleOptions = component['roleOptions']();
    expect(roleOptions.find((x) => x.label === 'ULB')?.isDisabled).toBeTrue();
    expect(roleOptions.find((x) => x.label === 'STATE')?.isDisabled).toBeTrue();
    expect(roleOptions.find((x) => x.label === 'MOHUA')?.isDisabled).toBeTrue();
  });

  it('should clear a previously selected valid year when an invalid year is selected next', () => {
    component['updateSelectedYear']('2024-25');
    expect(component['selectedYearId']()).toBe('2024-25' as XvifcYearId);

    component['updateSelectedYear']('invalid-year');
    expect(component['selectedYearId']()).toBeNull();
  });

  it('should update correctly when changing from one valid year to another', () => {
    component['updateSelectedYear']('2024-25');
    expect(component['selectedYearId']()).toBe('2024-25' as XvifcYearId);

    component['updateSelectedYear']('2025-26');
    expect(component['selectedYearId']()).toBe('2025-26' as XvifcYearId);

    const ulb = component['roleOptions']().find((x) => x.label === 'ULB');
    expect(ulb?.routerLink).toEqual(
      buildXvifcFeatureLink('ULB', '2025-26' as XvifcYearId, 'overview'),
    );
  });

  it('should keep ULB, STATE, and MOHUA active by business rule', () => {
    const roleOptions = component['roleOptions']();

    expect(roleOptions.find((x) => x.label === 'ULB')?.isActive).toBeTrue();
    expect(roleOptions.find((x) => x.label === 'STATE')?.isActive).toBeTrue();
    expect(roleOptions.find((x) => x.label === 'MOHUA')?.isActive).toBeTrue();
  });

  it('should always keep DOE inactive by business rule', () => {
    component['updateSelectedYear']('2024-25');

    const doe = component['roleOptions']().find((x) => x.label === 'DOE');
    expect(doe?.isActive).toBeFalse();
  });
});
