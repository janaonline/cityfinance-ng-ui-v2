import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PercentprogressPipe } from './percentprogress.pipe';

describe('PercentprogressPipe', () => {
  it('create an instance', () => {
    const pipe = new PercentprogressPipe();
    expect(pipe).toBeTruthy();
  });
});
