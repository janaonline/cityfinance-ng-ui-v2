import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidelinesBrochureVideoComponent } from './guidelines-brochure-video.component';

describe('GuidelinesBrochureVideoComponent', () => {
  let component: GuidelinesBrochureVideoComponent;
  let fixture: ComponentFixture<GuidelinesBrochureVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, GuidelinesBrochureVideoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GuidelinesBrochureVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
