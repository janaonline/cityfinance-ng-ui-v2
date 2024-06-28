import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurComponent } from './dur.component';

describe('DurComponent', () => {
  let component: DurComponent;
  let fixture: ComponentFixture<DurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
