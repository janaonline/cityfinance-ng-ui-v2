import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlbComponent } from './slb.component';

describe('SlbComponent', () => {
  let component: SlbComponent;
  let fixture: ComponentFixture<SlbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
