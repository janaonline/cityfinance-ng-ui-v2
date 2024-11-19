import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidelinesBrochureVideoComponent } from './guidelines-brochure-video.component';

describe('GuidelinesBrochureVideoComponent', () => {
  let component: GuidelinesBrochureVideoComponent;
  let fixture: ComponentFixture<GuidelinesBrochureVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuidelinesBrochureVideoComponent]
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
