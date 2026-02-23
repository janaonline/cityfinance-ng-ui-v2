import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsArApproveModalComponent } from './afs-ar-approve-modal.component';

describe('AfsArApproveModalComponent', () => {
  let component: AfsArApproveModalComponent;
  let fixture: ComponentFixture<AfsArApproveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsArApproveModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsArApproveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
