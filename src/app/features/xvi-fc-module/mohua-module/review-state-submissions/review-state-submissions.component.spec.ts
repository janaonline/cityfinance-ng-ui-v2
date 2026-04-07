import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewStateSubmissionsComponent } from './review-state-submissions.component';

describe('ReviewStateSubmissionsComponent', () => {
  let component: ReviewStateSubmissionsComponent;
  let fixture: ComponentFixture<ReviewStateSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewStateSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewStateSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
