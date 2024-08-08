import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XviFcReviewComponent } from './xvi-fc-review.component';

describe('XviFcReviewComponent', () => {
  let component: XviFcReviewComponent;
  let fixture: ComponentFixture<XviFcReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XviFcReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XviFcReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
