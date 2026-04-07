import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoeStatusComponent } from './doe-status.component';

describe('DoeStatusComponent', () => {
  let component: DoeStatusComponent;
  let fixture: ComponentFixture<DoeStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoeStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoeStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
