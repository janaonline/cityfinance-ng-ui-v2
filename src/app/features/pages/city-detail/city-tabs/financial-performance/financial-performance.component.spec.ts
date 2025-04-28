import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialPerformanceComponent } from './financial-performance.component';

describe('FinancialPerformanceComponent', () => {
  let component: FinancialPerformanceComponent;
  let fixture: ComponentFixture<FinancialPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialPerformanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinancialPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
