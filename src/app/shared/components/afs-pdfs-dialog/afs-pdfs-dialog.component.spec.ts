import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsPdfsDialogComponent } from './afs-pdfs-dialog.component';

describe('AfsPdfsDialogComponent', () => {
  let component: AfsPdfsDialogComponent;
  let fixture: ComponentFixture<AfsPdfsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsPdfsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfsPdfsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
