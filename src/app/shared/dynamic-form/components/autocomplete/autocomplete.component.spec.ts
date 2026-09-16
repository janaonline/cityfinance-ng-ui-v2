import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { FieldConfig } from '../../field.interface';
import { AutocompleteComponent } from './autocomplete.component';

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent;
  let fixture: ComponentFixture<AutocompleteComponent>;
  let httpMock: HttpTestingController;

  function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
    return {
      key: 'ulb',
      label: 'ULB',
      formFieldType: 'autocomplete',
      validations: [],
      remoteSearch: { endpoint: 'master/ulb', extraParams: { isActive: true } },
      ...overrides,
    } as FieldConfig;
  }

  function createGroup(key = 'ulb', value: string | null = null): FormGroup {
    return new FormGroup({ [key]: new FormControl(value) });
  }

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
    component.field = field;
    component.group = group;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent, ReactiveFormsModule, NoopAnimationsModule, HttpClientTestingModule],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('makes no HTTP call below the minLength threshold', fakeAsync(() => {
    setup(createField(), createGroup());

    component.searchCtrl.setValue('a');
    tick(300);

    httpMock.expectNone(() => true);
    expect(component.results()).toEqual([]);
  }));

  it('debounces and fires exactly one call once the user pauses typing', fakeAsync(() => {
    setup(createField(), createGroup());

    component.searchCtrl.setValue('ag');
    tick(100);
    component.searchCtrl.setValue('agr');
    tick(100);
    component.searchCtrl.setValue('agra');
    tick(300);

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.api.url2}master/ulb` && r.params.get('search') === 'agra',
    );
    expect(req.request.params.get('isActive')).toBe('true');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({
      success: true,
      data: { data: [{ _id: 'ulb-1', name: 'Agra' }], page: 1, limit: 10, total: 1, pages: 1 },
    });
    tick();

    expect(component.results()).toEqual([{ id: 'ulb-1', label: 'Agra' }]);
  }));

  it('selecting an option sets the real control to the plain id, not an object', fakeAsync(() => {
    const group = createGroup();
    setup(createField(), group);

    component.searchCtrl.setValue('agra');
    tick(300);
    httpMock
      .expectOne(() => true)
      .flush({
        success: true,
        data: { data: [{ _id: 'ulb-1', name: 'Agra' }], page: 1, limit: 10, total: 1, pages: 1 },
      });
    tick();

    component.onOptionSelected({ option: { value: 'ulb-1' } } as any);

    expect(group.controls['ulb'].value).toBe('ulb-1');
    expect(component.searchCtrl.value).toBe('Agra');
  }));

  it('a failed search yields an empty result list, not a thrown error', fakeAsync(() => {
    setup(createField(), createGroup());

    component.searchCtrl.setValue('agra');
    tick(300);
    httpMock.expectOne(() => true).error(new ProgressEvent('network error'));
    tick();

    expect(component.results()).toEqual([]);
    expect(component.loading()).toBeFalse();
  }));

  it('blur without a matching selection clears both the text and the control', fakeAsync(() => {
    const group = createGroup('ulb', 'stale-id');
    setup(createField(), group);

    component.searchCtrl.setValue('something typed but never picked', { emitEvent: false });
    component.onBlur();

    expect(group.controls['ulb'].value).toBeNull();
    expect(component.searchCtrl.value).toBe('');
  }));

  it('blur after a genuine selection leaves the control untouched', fakeAsync(() => {
    const group = createGroup();
    setup(createField(), group);

    component.searchCtrl.setValue('agra');
    tick(300);
    httpMock
      .expectOne(() => true)
      .flush({
        success: true,
        data: { data: [{ _id: 'ulb-1', name: 'Agra' }], page: 1, limit: 10, total: 1, pages: 1 },
      });
    tick();
    component.onOptionSelected({ option: { value: 'ulb-1' } } as any);

    component.onBlur();

    expect(group.controls['ulb'].value).toBe('ulb-1');
    expect(component.searchCtrl.value).toBe('Agra');
  }));

  it('makes no HTTP calls for a field without a remoteSearch config', fakeAsync(() => {
    setup(createField({ remoteSearch: undefined }), createGroup());

    component.searchCtrl.setValue('agra');
    tick(300);

    httpMock.expectNone(() => true);
    expect(component.results()).toEqual([]);
  }));
});
