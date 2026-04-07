import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbModuleComponent } from './ulb-module.component';

describe('UlbModuleComponent', () => {
  let component: UlbModuleComponent;
  let fixture: ComponentFixture<UlbModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UlbModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlbModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
