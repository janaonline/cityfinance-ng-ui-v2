import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbDialogComponent } from './ulb-dialog.component';

describe('UlbDialogComponent', () => {
  let component: UlbDialogComponent;
  let fixture: ComponentFixture<UlbDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { action: 'Edit', ulbId: null },
        },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, UlbDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UlbDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
