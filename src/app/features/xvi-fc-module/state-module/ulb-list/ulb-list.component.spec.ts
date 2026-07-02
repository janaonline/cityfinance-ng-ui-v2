import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbListComponent } from './ulb-list.component';

describe('UlbListComponent', () => {
  let component: UlbListComponent;
  let fixture: ComponentFixture<UlbListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UlbListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlbListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
