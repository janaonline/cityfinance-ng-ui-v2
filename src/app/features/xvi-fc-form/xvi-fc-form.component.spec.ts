import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XviFcFormComponent } from './xvi-fc-form.component';

describe('XviFcFormComponent', () => {
  let component: XviFcFormComponent;
  let fixture: ComponentFixture<XviFcFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XviFcFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XviFcFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
