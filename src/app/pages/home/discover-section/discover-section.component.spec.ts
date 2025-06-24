import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverSectionComponent } from './discover-section.component';

describe('DiscoverSectionComponent', () => {
  let component: DiscoverSectionComponent;
  let fixture: ComponentFixture<DiscoverSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscoverSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
