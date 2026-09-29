import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearsSelectionComponent } from './years-selection.component';
import { environment } from '../../../../../environments/environment';

const YEARS_URL = `${environment.api.url2}xvi-fc/years`;

describe('YearsSelectionComponent', () => {
  let component: YearsSelectionComponent;
  let fixture: ComponentFixture<YearsSelectionComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, YearsSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearsSelectionComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('buckets years into selectable/locked by the enabled flag, not by array position, and pre-selects the earliest enabled year', () => {
    httpMock.expectOne(YEARS_URL).flush([
      { _id: 'y1', year: '2026-27', isEnabled: false },
      { _id: 'y2', year: '2027-28', isEnabled: false },
      { _id: 'y3', year: '2028-29', isEnabled: true },
      { _id: 'y4', year: '2029-30', isEnabled: true },
      { _id: 'y5', year: '2030-31', isEnabled: true },
    ]);
    fixture.detectChanges();

    expect(component.enabledYears()).toEqual(['2028-29', '2029-30', '2030-31']);
    expect(component.disabledYears()).toEqual(['2026-27', '2027-28']);
    expect(component.selectedYear()).toBe('2028-29');

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelectorAll('.year-active-tile').length).toBe(3);
    expect(html.querySelectorAll('.year-locked-tile').length).toBe(2);
  });

  it('selectYear can select any enabled year, not just the pre-selected one', () => {
    httpMock.expectOne(YEARS_URL).flush([
      { _id: 'y1', year: '2026-27', isEnabled: true },
      { _id: 'y2', year: '2027-28', isEnabled: true },
    ]);
    fixture.detectChanges();

    component.selectYear('2027-28');

    expect(component.selectedYear()).toBe('2027-28');
  });

  it('leaves both buckets empty and selection unset when the backend returns no years', () => {
    httpMock.expectOne(YEARS_URL).flush([]);
    fixture.detectChanges();

    expect(component.enabledYears()).toEqual([]);
    expect(component.disabledYears()).toEqual([]);
    expect(component.selectedYear()).toBe('');
  });
});
