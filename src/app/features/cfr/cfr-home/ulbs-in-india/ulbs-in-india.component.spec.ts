import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UlbsInIndiaComponent } from './ulbs-in-india.component';
import { FiscalRankingService } from '../../services/fiscal-ranking.service';

describe('UlbsInIndiaComponent', () => {
  let component: UlbsInIndiaComponent;
  let fixture: ComponentFixture<UlbsInIndiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [
      { provide: MatDialogRef, useValue: { close: () => undefined } },
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: FiscalRankingService, useValue: { getApiResponse: () => of({ data: { mapData: [] } }) } },
    ], imports: [HttpClientTestingModule, RouterTestingModule,  UlbsInIndiaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UlbsInIndiaComponent);
    component = fixture.componentInstance;
    component.data = {
      rankedUlbCount: 0,
      columns: [],
      data: [],
      bucketWiseTopUlbs: { bucketWiseTopUlbsArr: [], columns: [] },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
