import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TowordPipe } from './toword.pipe';

describe('TowordPipe', () => {
  it('create an instance', () => {
    const pipe = new TowordPipe();
    expect(pipe).toBeTruthy();
  });
});
