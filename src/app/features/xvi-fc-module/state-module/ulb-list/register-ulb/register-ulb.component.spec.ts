import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RegisterUlbComponent } from './register-ulb.component';
import { UlbMasterService } from '../ulb-master.service';
import { IApiEnvelope } from '../../../../../core/models/ulb-master';
import { FormSectionConfig } from '../../../../../shared/dynamic-form/field.interface';

describe('RegisterUlbComponent', () => {
  let component: RegisterUlbComponent;
  let fixture: ComponentFixture<RegisterUlbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ yearId: 'year-1' }) } },
        },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, RegisterUlbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reads yearId from the route params', () => {
    expect(component.yearId).toBe('year-1');
  });

  it('hasUnsavedChanges is false before the form has finished loading', () => {
    expect(component.hasUnsavedChanges()).toBeFalse();
  });

  // ─── hasUnsavedChanges once the STATE registration form has loaded ────────

  describe('hasUnsavedChanges (STATE user, form loaded)', () => {
    beforeEach(() => {
      localStorage.setItem('userData', JSON.stringify({ role: 'STATE', state: 'state-1' }));

      const sections: FormSectionConfig[] = [
        {
          title: 'Basic details',
          fields: [{ key: 'ulbName', formFieldType: 'text', label: 'ULB Name', value: null }],
        },
      ];
      const response: IApiEnvelope<FormSectionConfig[]> = {
        success: true,
        data: sections,
        timestamp: '2026-08-12T00:00:00.000Z',
      };
      spyOn(TestBed.inject(UlbMasterService), 'getRegisterSections').and.returnValue(of(response));

      fixture = TestBed.createComponent(RegisterUlbComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      localStorage.removeItem('userData');
    });

    it('is false right after the form loads', () => {
      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('is true once the user edits a field', () => {
      component.form.get('ulbName')?.markAsDirty();

      expect(component.hasUnsavedChanges()).toBeTrue();
    });
  });
});
