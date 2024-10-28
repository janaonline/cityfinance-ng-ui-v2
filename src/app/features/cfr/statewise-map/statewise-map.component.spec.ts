import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatewiseMapComponent } from './statewise-map.component';

describe('StatewiseMapComponent', () => {
  let component: StatewiseMapComponent;
  let fixture: ComponentFixture<StatewiseMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatewiseMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatewiseMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
