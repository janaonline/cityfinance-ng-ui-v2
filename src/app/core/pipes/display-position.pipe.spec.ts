import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DisplayPositionPipe } from './display-position.pipe';

describe('DisplayPositionPipe', () => {
  it('create an instance', () => {
    const pipe = new DisplayPositionPipe();
    expect(pipe).toBeTruthy();
  });
});
