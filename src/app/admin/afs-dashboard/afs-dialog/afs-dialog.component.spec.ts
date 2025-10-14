import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsDialogComponent } from './afs-dialog.component';

describe('AfsDialogComponent', () => {
  let component: AfsDialogComponent;
  let fixture: ComponentFixture<AfsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
