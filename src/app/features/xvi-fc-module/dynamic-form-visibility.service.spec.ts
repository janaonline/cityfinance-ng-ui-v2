import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DynamicFormVisibilityService } from './dynamic-form-visibility.service';

describe('DynamicFormVisibilityService', () => {
  let service: DynamicFormVisibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }] });
    service = TestBed.inject(DynamicFormVisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
