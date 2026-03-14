import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfcStatusComponent } from './sfc-status.component';

describe('SfcStatusComponent', () => {
  let component: SfcStatusComponent;
  let fixture: ComponentFixture<SfcStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfcStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfcStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
