import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermOfPrivacyComponent } from './term-of-privacy.component';

describe('TermOfPrivacyComponent', () => {
  console.log('TermOfPrivacyComponent test - INIT');
  let component: TermOfPrivacyComponent;
  let fixture: ComponentFixture<TermOfPrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, TermOfPrivacyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TermOfPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('TermOfPrivacyComponent - should create');
    expect(component).toBeTruthy();
  });
  console.log('TermOfPrivacyComponent test - STOP');
});
