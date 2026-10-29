import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IUlbMaster } from '../../../../core/models/ulb-master';
import { UlbListComponent } from './ulb-list.component';

describe('UlbListComponent', () => {
  let component: UlbListComponent;
  let fixture: ComponentFixture<UlbListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, UlbListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UlbListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('UlbListComponent — ADC ownership', () => {
  const ulb = (overrides: Partial<IUlbMaster> = {}): IUlbMaster =>
    ({ _id: 'u1', state: 's1', approval: { status: 'REJECTED' }, adc: null, ...overrides }) as IUlbMaster;

  function create(user: Record<string, unknown>): { component: UlbListComponent; httpMock: HttpTestingController } {
    localStorage.setItem('userData', JSON.stringify(user));
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule, UlbListComponent] });
    const fixture = TestBed.createComponent(UlbListComponent);
    fixture.detectChanges();
    return { component: fixture.componentInstance, httpMock: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => localStorage.clear());

  it('a State user can edit only a REJECTED ULB that no ADC owns', () => {
    const { component } = create({ role: 'STATE', accessLevel: 'EDITOR', state: 's1' });

    expect(component.canEdit(ulb())).toBeTrue();
    expect(component.canEdit(ulb({ adc: { _id: 'a1', name: 'ADC One' } }))).toBeFalse();
    expect(component.canEdit(ulb({ approval: { status: 'PENDING' } }))).toBeFalse();
    expect(component.canCreate).toBeTrue();
  });

  it('an ADC reviewer can create ULBs and edit its own REJECTED ones; an ADC viewer can do neither', () => {
    const reviewer = create({ role: 'STATE', accessLevel: 'EDITOR', state: 's1', adc: 'a1' });
    expect(reviewer.component.isAdcUser).toBeTrue();
    expect(reviewer.component.canCreate).toBeTrue();
    expect(reviewer.component.canEdit(ulb({ adc: { _id: 'a1', name: 'ADC One' } }))).toBeTrue();
    TestBed.resetTestingModule();

    const viewer = create({ role: 'STATE', accessLevel: 'VIEWER', state: 's1', adc: 'a1' });
    expect(viewer.component.canCreate).toBeFalse();
    expect(viewer.component.canEdit(ulb({ adc: { _id: 'a1', name: 'ADC One' } }))).toBeFalse();
  });

  it('an ADC user never asks for the ADC list (its list is already only its own ULBs)', () => {
    const { httpMock } = create({ role: 'STATE', accessLevel: 'EDITOR', state: 's1', adc: 'a1' });

    httpMock.expectNone((r) => r.url.endsWith('master/adc'));
  });

  it('only ADMIN can assign an ADC, and only on ULBs whose state has ADCs; the ADC column appears once ADCs exist', () => {
    const { component, httpMock } = create({ role: 'ADMIN' });
    expect(component.canAssignAdc(ulb({ state: 's1' }))).toBeFalse();

    httpMock.expectOne((r) => r.url.endsWith('master/adc')).flush({ data: [{ _id: 'a1', name: 'ADC One', state: 's1' }] });

    expect(component.canAssignAdc(ulb({ state: 's1' }))).toBeTrue();
    expect(component.canAssignAdc(ulb({ state: 's2' }))).toBeFalse();
    expect(component.displayedColumns).toContain('adc');
  });
});
