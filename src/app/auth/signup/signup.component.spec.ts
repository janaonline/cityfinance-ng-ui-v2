import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  async function configure(type?: string) {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule, SignupComponent], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }, 
        provideHttpClient(),
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(type ? { type } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await configure('15thFC');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read a valid type from query params and load states on init', fakeAsync(() => {
    component.ngOnInit();

    expect(component.typeKey()).toBe('15thFC');
    expect(component.isLoadingStates()).toBeTrue();

    tick(700);

    expect(component.isLoadingStates()).toBeFalse();
    expect(component.states()).toEqual([
      { id: '1', name: 'Andhra Pradesh' },
      { id: '2', name: 'Karnataka' },
      { id: '3', name: 'Tamil Nadu' },
      { id: '4', name: 'Kerala' },
      { id: '5', name: 'Maharashtra' },
    ]);
  }));

  it('should default typeKey to 16thFC when query param is missing or unsupported', async () => {
    TestBed.resetTestingModule();
    await configure('unknown');

    component.ngOnInit();

    expect(component.typeKey()).toBe('16thFC');
  });

  it('should mark controls as touched and not submit when the form is invalid', () => {
    component.onSubmit();

    expect(component.signupForm.touched).toBeTrue();
    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSuccess()).toBeFalse();
  });

  it('should validate email and Indian mobile number formats', () => {
    component.signupForm.patchValue({
      stateId: '1',
      ulbName: 'Test ULB',
      email: 'not-an-email',
      contactNumber: '1234567890',
    });

    expect(component.signupForm.controls.email.hasError('email')).toBeTrue();
    expect(component.signupForm.controls.contactNumber.hasError('pattern')).toBeTrue();

    component.signupForm.patchValue({
      email: 'ulb@example.com',
      contactNumber: '9876543210',
    });

    expect(component.signupForm.valid).toBeTrue();
  });

  it('should submit a valid signup request, show success, and disable the form', fakeAsync(() => {
    spyOn(console, 'log');
    component.signupForm.setValue({
      stateId: '2',
      ulbName: 'Sample ULB',
      email: 'sample@example.com',
      contactNumber: '9876543210',
    });

    component.onSubmit();

    expect(component.isSubmitting()).toBeTrue();

    tick(1000);

    expect(console.log).toHaveBeenCalledWith('ULB signup payload', {
      stateId: '2',
      ulbName: 'Sample ULB',
      email: 'sample@example.com',
      contactNumber: '9876543210',
    });
    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSuccess()).toBeTrue();
    expect(component.signupForm.disabled).toBeTrue();
  }));

  it('should navigate back to login with the selected type', () => {
    component.typeKey.set('15thFC');

    component.onBackToLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { type: '15thFC' },
    });
  });

  it('should navigate back to login without query params when typeKey is null', () => {
    component.typeKey.set(null);

    component.onBackToLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: {},
    });
  });
});
