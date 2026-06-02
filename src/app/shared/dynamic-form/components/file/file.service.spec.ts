import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FileService } from './file.service';

xdescribe('FileService', () => {
  let service: FileService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }] });
    service = TestBed.inject(FileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
