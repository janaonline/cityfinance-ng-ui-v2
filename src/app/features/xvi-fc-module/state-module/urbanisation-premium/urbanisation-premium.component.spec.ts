import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrbanisationPremiumComponent } from './urbanisation-premium.component';

describe('UrbanisationPremiumComponent', () => {
  let component: UrbanisationPremiumComponent;
  let fixture: ComponentFixture<UrbanisationPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, UrbanisationPremiumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrbanisationPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
