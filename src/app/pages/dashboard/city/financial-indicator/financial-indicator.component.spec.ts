import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialIndicatorComponent } from './financial-indicator.component';

describe('FinancialIndicatorComponent', () => {
  let component: FinancialIndicatorComponent;
  let fixture: ComponentFixture<FinancialIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
