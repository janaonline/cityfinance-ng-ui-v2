import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrbanisationPremiumComponent } from './urbanisation-premium.component';

describe('UrbanisationPremiumComponent', () => {
  let component: UrbanisationPremiumComponent;
  let fixture: ComponentFixture<UrbanisationPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrbanisationPremiumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrbanisationPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
