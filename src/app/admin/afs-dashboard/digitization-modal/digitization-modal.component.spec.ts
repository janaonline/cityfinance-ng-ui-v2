import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitizationModalComponent } from './digitization-modal.component';

describe('DigitizationModalComponent', () => {
  let component: DigitizationModalComponent;
  let fixture: ComponentFixture<DigitizationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitizationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitizationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
