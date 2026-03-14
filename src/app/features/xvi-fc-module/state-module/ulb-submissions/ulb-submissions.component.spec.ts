import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbSubmissionsComponent } from './ulb-submissions.component';

describe('UlbSubmissionsComponent', () => {
  let component: UlbSubmissionsComponent;
  let fixture: ComponentFixture<UlbSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UlbSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlbSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
