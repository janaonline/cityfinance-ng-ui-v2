import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { FcUnspentMohuaRow, ROW_STATUS } from '../../fc-unspent-review.models';
import { FcUnspentMohuaReviewService } from '../../fc-unspent-review.service';
import { BulkRejectRowsDialogComponent, BulkRejectRowsDialogData } from './bulk-reject-rows-dialog.component';

function makeRow(id: string, ulbName: string): FcUnspentMohuaRow {
  return {
    _id: id,
    rowNumber: 1,
    ulbId: `ulb-${id}`,
    censusCode: '800123',
    sbCode: null,
    ulbName,
    allocationAmount: 20,
    unspentAmount: 1.5,
    allocationPerc: 7.5,
    eligibility: true,
    rowStatus: ROW_STATUS.UPDATE_PENDING,
    rejectionRemark: null,
    permissions: { canApprove: true, canReject: true },
  };
}

describe('BulkRejectRowsDialogComponent', () => {
  let fixture: ComponentFixture<BulkRejectRowsDialogComponent>;
  let component: BulkRejectRowsDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<BulkRejectRowsDialogComponent, boolean>>;
  let service: FcUnspentMohuaReviewService;

  const rows = [makeRow('row-1', 'Alpha ULB'), makeRow('row-2', 'Beta ULB')];
  const data: BulkRejectRowsDialogData = { stateId: 'state-1', yearId: 'year-1', rows };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<BulkRejectRowsDialogComponent, boolean>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BulkRejectRowsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BulkRejectRowsDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FcUnspentMohuaReviewService);
    fixture.detectChanges();
  });

  it('renders one remark control per selected row', () => {
    expect(component.rowsArray.length).toBe(2);
  });

  it('blocks submit when any row is missing a remark', () => {
    const submitSpy = spyOn(service, 'bulkRejectRows');
    component.rowGroupAt(0).controls.rejectionRemark.setValue('Missing docs');
    // row 1 left blank

    component.submit();
    fixture.detectChanges();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(component.isRemarkMissing(1)).toBe(true);
  });

  it('builds the exact indexed payload, trimmed, and closes with true on success', () => {
    const submitSpy = spyOn(service, 'bulkRejectRows').and.returnValue(
      of({ updatedRowCount: 2, rowSummary: { total: 2, active: 0, updatePending: 0, rejected: 2, needsUpdate: 0, eligible: 1, ineligible: 1 }, currentFormStatus: 5, currentFormStatusLabel: 'x', parentAcknowledged: false }),
    );
    component.rowGroupAt(0).controls.rejectionRemark.setValue('  Missing docs  ');
    component.rowGroupAt(1).controls.rejectionRemark.setValue('Wrong amount');

    component.submit();

    expect(submitSpy).toHaveBeenCalledWith({
      stateId: 'state-1',
      yearId: 'year-1',
      rows: [
        { rowId: 'row-1', rejectionRemark: 'Missing docs' },
        { rowId: 'row-2', rejectionRemark: 'Wrong amount' },
      ],
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('routes indexed rows.<i>.rejectionRemark backend errors to the matching row control and preserves entered text', () => {
    spyOn(service, 'bulkRejectRows').and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Validation failed.',
        errors: { 'rows.rejectionRemark': [{ field: 'rows.1.rejectionRemark', message: 'Too short.' }] },
      })),
    );
    component.rowGroupAt(0).controls.rejectionRemark.setValue('Missing docs');
    component.rowGroupAt(1).controls.rejectionRemark.setValue('x');

    component.submit();
    fixture.detectChanges();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.rowGroupAt(0).controls.rejectionRemark.value).toBe('Missing docs');
    expect(component.rowGroupAt(1).controls.rejectionRemark.value).toBe('x');
    expect(component.rowGroupAt(1).controls.rejectionRemark.errors?.['apiError']).toBe('Too short.');
  });

  it('shows a general form error for unrouteable backend errors (e.g. _form)', () => {
    spyOn(service, 'bulkRejectRows').and.returnValue(
      throwError(() => ({ success: false, message: 'Validation failed.', errors: { _form: [{ message: 'Some rows are already active.' }] } })),
    );
    component.rowGroupAt(0).controls.rejectionRemark.setValue('a');
    component.rowGroupAt(1).controls.rejectionRemark.setValue('b');

    component.submit();
    fixture.detectChanges();

    expect(component.formError()).toBe('Some rows are already active.');
  });

  it('clears a row apiError once its remark is edited', () => {
    component.rowGroupAt(0).controls.rejectionRemark.setErrors({ apiError: 'Too short.' });
    component.onRemarkInput(0);
    expect(component.rowGroupAt(0).controls.rejectionRemark.errors).toBeNull();
  });

  it('closes with false on cancel', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
