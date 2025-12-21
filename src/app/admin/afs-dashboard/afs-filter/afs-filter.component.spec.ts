import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsFilterComponent } from './afs-filter.component';

describe('AfsFilterComponent', () => {
  let component: AfsFilterComponent;
  let fixture: ComponentFixture<AfsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
