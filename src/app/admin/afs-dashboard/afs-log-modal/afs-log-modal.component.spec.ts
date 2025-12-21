import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsLogModalComponent } from './afs-log-modal.component';

describe('AfsLogModalComponent', () => {
  let component: AfsLogModalComponent;
  let fixture: ComponentFixture<AfsLogModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsLogModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
