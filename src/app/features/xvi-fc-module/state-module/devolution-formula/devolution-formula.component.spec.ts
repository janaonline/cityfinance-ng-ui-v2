import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolutionFormulaComponent } from './devolution-formula.component';

describe('DevolutionFormulaComponent', () => {
  let component: DevolutionFormulaComponent;
  let fixture: ComponentFixture<DevolutionFormulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, DevolutionFormulaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevolutionFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
