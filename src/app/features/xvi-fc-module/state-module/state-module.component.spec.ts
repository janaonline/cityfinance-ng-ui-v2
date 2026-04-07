import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateModuleComponent } from './state-module.component';

describe('StateModuleComponent', () => {
  let component: StateModuleComponent;
  let fixture: ComponentFixture<StateModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
