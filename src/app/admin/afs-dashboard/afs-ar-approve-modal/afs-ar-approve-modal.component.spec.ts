import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsArApproveModalComponent } from './afs-ar-approve-modal.component';

describe('AfsArApproveModalComponent', () => {
  let component: AfsArApproveModalComponent;
  let fixture: ComponentFixture<AfsArApproveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, AfsArApproveModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsArApproveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
