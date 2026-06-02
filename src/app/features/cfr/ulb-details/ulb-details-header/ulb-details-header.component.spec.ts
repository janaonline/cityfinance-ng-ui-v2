import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbDetailsHeaderComponent } from './ulb-details-header.component';

describe('UlbDetailsHeaderComponent', () => {
  let component: UlbDetailsHeaderComponent;
  let fixture: ComponentFixture<UlbDetailsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule,  UlbDetailsHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UlbDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
