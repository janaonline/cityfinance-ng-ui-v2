import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XviFCComponent } from './xvi-fc.component';

describe('XviFCComponent', () => {
  let component: XviFCComponent;
  let fixture: ComponentFixture<XviFCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XviFCComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(XviFCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
