import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingPracticeComponent } from './accounting-practice.component';

describe('AccountingPracticeComponent', () => {
  let component: AccountingPracticeComponent;
  let fixture: ComponentFixture<AccountingPracticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingPracticeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountingPracticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
