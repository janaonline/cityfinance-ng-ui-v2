import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearwiseFilesComponent } from './yearwise-files.component';

describe('YearwiseFilesComponent', () => {
  let component: YearwiseFilesComponent;
  let fixture: ComponentFixture<YearwiseFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearwiseFilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YearwiseFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
