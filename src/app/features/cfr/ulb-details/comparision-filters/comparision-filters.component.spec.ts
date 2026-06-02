import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisionFiltersComponent } from './comparision-filters.component';

describe('ComparisionFiltersComponent', () => {
  let component: ComparisionFiltersComponent;
  let fixture: ComponentFixture<ComparisionFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: { ulbs: [], datasetsFilter: {}, ulb: {} } }], imports: [HttpClientTestingModule, RouterTestingModule,  ComparisionFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparisionFiltersComponent);
    component = fixture.componentInstance;
    component.datasetsFilter = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
