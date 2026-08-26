import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { FieldConfig } from '../../field.interface';
import { InputComponent } from './input.component';

describe('InputComponent data-cy selectors', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
    return {
      key: 'testInput',
      label: 'Test Input',
      formFieldType: 'text',
      validations: [],
      ...overrides,
    } as FieldConfig;
  }

  function createGroup(key = 'testInput', value = ''): FormGroup {
    return new FormGroup({ [key]: new FormControl(value) });
  }

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    component.field = field;
    component.group = group;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule, NoopAnimationsModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('renders data-cy on a text input', () => {
    setup(createField({ key: 'myField', formFieldType: 'text' }), createGroup('myField'));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="myField-test"]');
    expect(input).toBeTruthy();
    expect(input.tagName.toLowerCase()).toBe('input');
  });

  it('renders data-cy on a number input', () => {
    setup(createField({ key: 'myNumber', formFieldType: 'number' }), createGroup('myNumber'));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="myNumber-test"]');
    expect(input).toBeTruthy();
  });

  it('renders data-cy on an amount input', () => {
    setup(createField({ key: 'grantAmount', formFieldType: 'amount' }), createGroup('grantAmount'));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="grantAmount-test"]');
    expect(input).toBeTruthy();
  });

  it('does not set data-cy when field.key is empty string', () => {
    const field = createField({ formFieldType: 'text' });
    (field as any).key = '';
    setup(field, new FormGroup({}));
    const el = fixture.nativeElement.querySelector('[data-cy]');
    expect(el).toBeNull();
  });
});

describe('InputComponent lookup', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let httpMock: HttpTestingController;

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    component.field = field;
    component.group = group;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule, NoopAnimationsModule, HttpClientTestingModule],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls the lookup endpoint once the value passes its own validators, and patches sibling controls', fakeAsync(() => {
    const group = new FormGroup({
      ifscCode: new FormControl('', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]),
      'bankDetails.name': new FormControl(''),
      'bankDetails.branch': new FormControl(''),
    });
    setup(
      {
        key: 'ifscCode',
        label: 'IFSC Code',
        formFieldType: 'text',
        lookup: {
          endpoint: 'xvi-fc/bank-account/ifsc/:value',
          populates: { 'bankDetails.name': 'bankDetails.name', 'bankDetails.branch': 'bankDetails.branch' },
        },
      } as FieldConfig,
      group,
    );

    group.controls['ifscCode'].setValue('SBIN0001234');
    tick(400);

    const req = httpMock.expectOne(`${environment.api.url2}xvi-fc/bank-account/ifsc/SBIN0001234`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: { ifscCode: 'SBIN0001234', bankDetails: { name: 'State Bank of India', branch: 'Main Branch' } },
    });
    tick();

    expect(group.controls['bankDetails.name'].value).toBe('State Bank of India');
    expect(group.controls['bankDetails.branch'].value).toBe('Main Branch');
  }));

  it('does not call the endpoint when the value fails its own validator', fakeAsync(() => {
    const group = new FormGroup({
      ifscCode: new FormControl('', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]),
      'bankDetails.name': new FormControl(''),
    });
    setup(
      {
        key: 'ifscCode',
        label: 'IFSC Code',
        formFieldType: 'text',
        lookup: { endpoint: 'xvi-fc/bank-account/ifsc/:value', populates: { 'bankDetails.name': 'bankDetails.name' } },
      } as FieldConfig,
      group,
    );

    group.controls['ifscCode'].setValue('not-a-valid-ifsc');
    tick(400);

    httpMock.expectNone(() => true);
  }));

  it('makes no HTTP calls for a field without a lookup config', fakeAsync(() => {
    const group = new FormGroup({ plain: new FormControl('') });
    setup({ key: 'plain', label: 'Plain', formFieldType: 'text' } as FieldConfig, group);

    group.controls['plain'].setValue('anything');
    tick(400);

    httpMock.expectNone(() => true);
  }));
});

describe('InputComponent digitsOnly', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    component.field = field;
    component.group = group;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule, NoopAnimationsModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('strips non-digit characters live and updates the control', () => {
    const group = new FormGroup({ accountNumber: new FormControl('') });
    setup({ key: 'accountNumber', label: 'Account Number', formFieldType: 'text', digitsOnly: true } as FieldConfig, group);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="accountNumber-test"]');
    input.value = '12a 34-56';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('123456');
    expect(group.controls['accountNumber'].value).toBe('123456');
  });

  it('leaves input untouched for a field without digitsOnly', () => {
    const group = new FormGroup({ name: new FormControl('') });
    setup({ key: 'name', label: 'Name', formFieldType: 'text' } as FieldConfig, group);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="name-test"]');
    input.value = 'John 123!';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('John 123!');
  });
});
