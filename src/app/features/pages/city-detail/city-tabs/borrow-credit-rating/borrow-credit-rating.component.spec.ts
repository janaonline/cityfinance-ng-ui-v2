import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowCreditRatingComponent } from './borrow-credit-rating.component';

describe('BorrowCreditRatingComponent', () => {
  let component: BorrowCreditRatingComponent;
  let fixture: ComponentFixture<BorrowCreditRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowCreditRatingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BorrowCreditRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
