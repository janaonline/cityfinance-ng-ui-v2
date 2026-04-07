import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MohuaModuleComponent } from './mohua-module.component';

describe('MohuaModuleComponent', () => {
  let component: MohuaModuleComponent;
  let fixture: ComponentFixture<MohuaModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MohuaModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MohuaModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
