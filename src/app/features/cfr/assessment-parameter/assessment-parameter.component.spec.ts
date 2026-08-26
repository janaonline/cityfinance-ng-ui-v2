import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AssessmentParameterComponent } from './assessment-parameter.component';
import { FiscalRankingService } from '../services/fiscal-ranking.service';

describe('AssessmentParameterComponent', () => {
  let component: AssessmentParameterComponent;
  let fixture: ComponentFixture<AssessmentParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [
      { provide: MatDialogRef, useValue: { close: () => undefined } },
      { provide: MAT_DIALOG_DATA, useValue: {} },
      {
        provide: FiscalRankingService,
        useValue: {
          callGetMethod: () => of({
            data: {
              resourceMobilization: {
                name: 'Resource Mobilization',
                description: '',
                table: { columns: [], data: [] },
              },
            },
          }),
        },
      },
    ], imports: [HttpClientTestingModule, RouterTestingModule,  AssessmentParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
