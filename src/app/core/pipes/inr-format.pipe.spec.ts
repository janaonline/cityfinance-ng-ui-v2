import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InrFormatPipe } from './inr-format.pipe';

describe('InrFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new InrFormatPipe();
    expect(pipe).toBeTruthy();
  });
});
