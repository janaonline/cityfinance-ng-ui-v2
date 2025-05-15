import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapStateRankComponent } from './map-state-rank.component';

describe('MapStateRankComponent', () => {
  let component: MapStateRankComponent;
  let fixture: ComponentFixture<MapStateRankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapStateRankComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapStateRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
