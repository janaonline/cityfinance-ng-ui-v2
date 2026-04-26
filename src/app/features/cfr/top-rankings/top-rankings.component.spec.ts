import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TopRankingsComponent } from './top-rankings.component';
import { AuthService } from '../../../core/services/auth.service';
import { FiscalRankingService } from '../services/fiscal-ranking.service';

describe('TopRankingsComponent', () => {
  let component: TopRankingsComponent;
  let fixture: ComponentFixture<TopRankingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [
      { provide: MatDialogRef, useValue: { close: () => undefined } },
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: AuthService, useValue: { loggedIn: () => false } },
      {
        provide: FiscalRankingService,
        useValue: {
          getApiResponse: () => of({ data: {} }),
          states: () => of({ data: [] }),
          topRankedUlbs: () => of({ tableData: { columns: [], data: [] }, total: 0, mapDataTopUlbs: [] }),
        },
      },
    ], imports: [HttpClientTestingModule, RouterTestingModule,  TopRankingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopRankingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
