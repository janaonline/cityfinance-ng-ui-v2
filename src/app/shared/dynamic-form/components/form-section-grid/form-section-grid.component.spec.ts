import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FormSectionGridComponent } from './form-section-grid.component';
import { FormSectionConfig } from '../../field.interface';

describe('FormSectionGridComponent', () => {
  let fixture: ComponentFixture<FormSectionGridComponent>;
  let componentRef: ComponentRef<FormSectionGridComponent>;

  const sections: FormSectionConfig[] = [
    {
      title: 'ULB Identity',
      icon: 'bi-bank',
      fields: [
        { key: 'name', label: 'ULB Name', formFieldType: 'input', required: true, grid: 'col-12' },
        {
          key: 'censusCode',
          label: '2011 Census Code',
          formFieldType: 'input',
          grid: 'col-md-6',
          labelHint: '(if available)',
          hintText: 'Not available? Enter 999999 as a 6-digit placeholder.',
        },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSectionGridComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSectionGridComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('sections', sections);
    componentRef.setInput('group', new FormGroup({ name: new FormControl(''), censusCode: new FormControl('') }));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a section title and icon', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.form-section-grid__title');
    expect(title.textContent).toContain('ULB Identity');
    expect(title.querySelector('i.bi-bank')).toBeTruthy();
  });

  it('renders required asterisk and label hint per field config', () => {
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.form-section-grid__label');
    expect(labels[0].textContent).toContain('ULB Name');
    expect(labels[0].querySelector('.text-danger')).toBeTruthy();
    expect(labels[1].textContent).toContain('(if available)');
  });

  it('renders hint text below the field', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Not available? Enter 999999 as a 6-digit placeholder.');
  });

  it('applies the configured grid class to each field wrapper', () => {
    fixture.detectChanges();
    const wrappers = fixture.nativeElement.querySelectorAll('.row > div');
    expect(wrappers[0].classList).toContain('col-12');
    expect(wrappers[1].classList).toContain('col-md-6');
  });
});
