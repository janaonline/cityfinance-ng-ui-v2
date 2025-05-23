import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadPdfComponent } from './download-pdf.component';

describe('DowloadPdfComponent', () => {
  let component: DownloadPdfComponent;
  let fixture: ComponentFixture<DownloadPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadPdfComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DownloadPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
