import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolutionFormulaComponent } from './devolution-formula.component';

describe('DevolutionFormulaComponent', () => {
  let component: DevolutionFormulaComponent;
  let fixture: ComponentFixture<DevolutionFormulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevolutionFormulaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevolutionFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
