import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialInfrastructureComponent } from './special-infrastructure.component';

describe('SpecialInfrastructureComponent', () => {
  let component: SpecialInfrastructureComponent;
  let fixture: ComponentFixture<SpecialInfrastructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialInfrastructureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialInfrastructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
