import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableRowCalculatorPipe } from './table-row-calculator.pipe';

describe('TableRowCalculatorPipe', () => {
  it('create an instance', () => {
    const pipe = new TableRowCalculatorPipe();
    expect(pipe).toBeTruthy();
  });
});
