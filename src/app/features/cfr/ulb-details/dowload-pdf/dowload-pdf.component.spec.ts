import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DowloadPdfComponent } from './dowload-pdf.component';

describe('DowloadPdfComponent', () => {
  let component: DowloadPdfComponent;
  let fixture: ComponentFixture<DowloadPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DowloadPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DowloadPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
