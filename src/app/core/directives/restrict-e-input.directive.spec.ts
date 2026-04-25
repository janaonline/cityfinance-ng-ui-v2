import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestrictEInputDirective } from './restrict-e-input.directive';

describe('RestrictEInputDirective', () => {
  it('should create an instance', () => {
    const directive = new RestrictEInputDirective();
    expect(directive).toBeTruthy();
  });
});
