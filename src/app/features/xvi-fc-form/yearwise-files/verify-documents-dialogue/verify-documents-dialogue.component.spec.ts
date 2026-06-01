import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyDocumentsDialogueComponent } from './verify-documents-dialogue.component';

xdescribe('VerifyDocumentsDialogueComponent', () => {
  let component: VerifyDocumentsDialogueComponent;
  let fixture: ComponentFixture<VerifyDocumentsDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, VerifyDocumentsDialogueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyDocumentsDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
