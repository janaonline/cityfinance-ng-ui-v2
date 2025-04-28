import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMapSectionComponent } from './dashboard-map-section.component';

describe('DashboardMapSectionComponent', () => {
  let component: DashboardMapSectionComponent;
  let fixture: ComponentFixture<DashboardMapSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMapSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardMapSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
