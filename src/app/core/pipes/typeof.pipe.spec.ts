import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TypeofPipe } from './typeof.pipe';

describe('TypeofPipe', () => {
  it('create an instance', () => {
    const pipe = new TypeofPipe();
    expect(pipe).toBeTruthy();
  });
});
