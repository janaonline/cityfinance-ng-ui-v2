import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FileUrlCheckPipe } from './file-url-check.pipe';

describe('FileUrlCheckPipe', () => {
  it('create an instance', () => {
    const pipe = new FileUrlCheckPipe();
    expect(pipe).toBeTruthy();
  });
});
