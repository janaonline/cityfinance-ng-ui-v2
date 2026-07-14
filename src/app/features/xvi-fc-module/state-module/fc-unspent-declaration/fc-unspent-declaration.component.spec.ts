import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FcUnspentDeclarationComponent } from './fc-unspent-declaration.component';

describe('FcUnspentDeclarationComponent', () => {
  let component: FcUnspentDeclarationComponent;
  let fixture: ComponentFixture<FcUnspentDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, FcUnspentDeclarationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FcUnspentDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
