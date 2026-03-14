import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XviFcModuleComponent } from './xvi-fc-module.component';

describe('XviFcModuleComponent', () => {
  let component: XviFcModuleComponent;
  let fixture: ComponentFixture<XviFcModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XviFcModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XviFcModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
