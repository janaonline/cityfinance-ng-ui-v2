import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbSubmissionsComponent } from './ulb-submissions.component';

describe('UlbSubmissionsComponent', () => {
  let component: UlbSubmissionsComponent;
  let fixture: ComponentFixture<UlbSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, UlbSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlbSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
