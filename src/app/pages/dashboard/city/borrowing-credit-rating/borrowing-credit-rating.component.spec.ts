import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowingCreditRatingComponent } from './borrowing-credit-rating.component';

describe('BorrowingCreditRatingComponent', () => {
  let component: BorrowingCreditRatingComponent;
  let fixture: ComponentFixture<BorrowingCreditRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowingCreditRatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BorrowingCreditRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
