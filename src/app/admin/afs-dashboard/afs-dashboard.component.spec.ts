import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsDashboardComponent } from './afs-dashboard.component';

describe('AfsDashboardComponent', () => {
  let component: AfsDashboardComponent;
  let fixture: ComponentFixture<AfsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
