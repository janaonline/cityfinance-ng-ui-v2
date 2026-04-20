import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportHoursComponent } from './support-hours.component';

describe('SupportHoursComponent', () => {
  let component: SupportHoursComponent;
  let fixture: ComponentFixture<SupportHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportHoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
