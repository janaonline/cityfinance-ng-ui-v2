import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AfsLogModalComponent } from './afs-log-modal.component';
import { AfsService } from '../afs.service';

describe('AfsLogModalComponent', () => {
  let component: AfsLogModalComponent;
  let fixture: ComponentFixture<AfsLogModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [
      { provide: MatDialogRef, useValue: { close: () => undefined } },
      { provide: MAT_DIALOG_DATA, useValue: { requestId: 'req-1' } },
      {
        provide: AfsService,
        useValue: {
          getRequestLog: () => of({
            data: {
              FinalStatusCode: 200,
              Timestamp: '2026-01-01T00:00:00.000Z',
              RequestId: 'req-1',
            },
          }),
        },
      },
    ], imports: [HttpClientTestingModule, RouterTestingModule, AfsLogModalComponent]
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
