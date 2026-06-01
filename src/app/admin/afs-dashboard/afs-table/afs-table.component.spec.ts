import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AfsTableComponent } from './afs-table.component';
import { AfsService } from '../afs.service';

describe('AfsTableComponent', () => {
  let component: AfsTableComponent;
  let fixture: ComponentFixture<AfsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [
      { provide: MatDialogRef, useValue: { close: () => undefined } },
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: AfsService, useValue: { getAfsList: () => of({ data: [], totalCount: 0 }) } },
    ], imports: [HttpClientTestingModule, RouterTestingModule, AfsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsTableComponent);
    fixture.componentRef.setInput('filters', {});
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
