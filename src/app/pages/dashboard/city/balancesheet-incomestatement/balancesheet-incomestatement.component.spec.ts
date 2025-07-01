import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancesheetIncomestatementComponent } from './balancesheet-incomestatement.component';

describe('BalancesheetIncomestatementComponent', () => {
  let component: BalancesheetIncomestatementComponent;
  let fixture: ComponentFixture<BalancesheetIncomestatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalancesheetIncomestatementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalancesheetIncomestatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
