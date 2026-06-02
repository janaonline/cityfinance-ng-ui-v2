import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlreadyUpdatedUrlPipe } from './already-updated-url.pipe';

describe('AlreadyUpdatedUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new AlreadyUpdatedUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
