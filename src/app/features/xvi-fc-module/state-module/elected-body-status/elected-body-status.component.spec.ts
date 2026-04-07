import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectedBodyStatusComponent } from './elected-body-status.component';

describe('ElectedBodyStatusComponent', () => {
  let component: ElectedBodyStatusComponent;
  let fixture: ComponentFixture<ElectedBodyStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectedBodyStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectedBodyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
