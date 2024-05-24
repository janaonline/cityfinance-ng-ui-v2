import { Component, EventEmitter, forwardRef, Input, OnInit, Optional, Output, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PmuApprovalPopupComponent } from '../pmu-approval-popup/pmu-approval-popup.component';
import { PmuRejectionPopupComponent } from '../pmu-rejection-popup/pmu-rejection-popup.component';
import { UlbActionPopupComponent } from '../ulb-action-popup/ulb-action-popup.component';
import { USER_TYPE } from '../../../../core/models/user/userType';
import { UserUtility } from '../../../../core/util/user/user';
import { APPROVAL_TYPES } from '../../../../core/models/models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-common-action-radio',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './common-action-radio.component.html',
  styleUrls: ['./common-action-radio.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => CommonActionRadioComponent)
  }]
})
export class CommonActionRadioComponent implements ControlValueAccessor {
  @Output() onRejectReasonChange = new EventEmitter<any>();
  @Output() onReject = new EventEmitter<any>();

  @Input() formFieldType: FormControl | undefined;
  @Input() disabled: boolean = false;
  @Input() rejectReason: FormControl | undefined;
  @Input()
  rejectReason2!: FormControl;
  @Input()
  ulbComment!: FormControl;
  @Input()
  suggestedValue!: FormControl;
  @Input()
  pmuSuggestedValue2!: FormControl;
  @Input()
  originalValue!: FormControl;
  @Input()
  approvalType!: FormControl;
  @Input()
  ulbValue!: FormControl;
  @Input()
  date!: FormControl;
  @Input()
  isInvalid!: boolean;
  @Input()
  title!: string;
  @Input()
  subTitle!: string;
  @Input() canSuggestValue: boolean = false;
  @Input()
  disableReject!: any;


  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  userTypes = USER_TYPE;

  private onChange!: (value: any) => void;
  private onTouched!: () => void;

  constructor(
    private matDialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  status: '' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';

  get canShow() {
    if (this.disabled) return ['APPROVED', 'REJECTED'].includes(this.status)
    return !!this.status;
  }

  get isUlb() {
    return this.loggedInUserDetails?.role == this.userTypes.ULB;
  }

  get disableApprove() {
    return this.status === 'APPROVED'
      &&
      (!this.suggestedValue?.value || (this.suggestedValue?.value ||
        this.approvalType?.value == APPROVAL_TYPES.enteredPmuAcceptUlb));
  }

  get isApprovable() {
    return [
      APPROVAL_TYPES.enteredUlbAcceptPmu,
      APPROVAL_TYPES.enteredPmuAcceptPmu,
      APPROVAL_TYPES.enteredPmuSecondAcceptPmu
    ].includes(this.approvalType?.value);
  }

  writeValue(value: any): void {
    this.status = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  updateStatus(value: '' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING'): void {
    if (this.disabled) return;
    if (value == 'REJECTED') return this.openRejectionDialog();
    if (value == 'APPROVED' && this.disableReject && this.suggestedValue?.value) return this.openApprovalDialog();

    if (value == 'APPROVED') {
      this.onReject.emit({ approvalType: APPROVAL_TYPES.ulbEnteredPmuAccept });
    }

    this.snackBar.open(`${(this.title || '')} ${(this.subTitle || ' ')} Approved`.trim(), '', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
    this.status = value;
    this.onChange(value);
    this.onTouched();
  }

  openRejectionDialog() {
    const dialog = this.matDialog.open(PmuRejectionPopupComponent, {
      data: {
        title: this.title,
        subTitle: this.subTitle,
        canSuggestValue: this.canSuggestValue,
        suggestedValue: this.suggestedValue?.value,
        rejectReason: this.rejectReason?.value,
        formFieldType: this.formFieldType?.value
      },
      width: '500px',
      maxHeight: '90vh'
    });

    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.onReject.emit(res);
      }
    })
  }


  openApprovalDialog() {
    const dialog = this.matDialog.open(PmuApprovalPopupComponent, {
      data: {
        title: this.title,
        subTitle: this.subTitle,
        canSuggestValue: this.canSuggestValue,
        suggestedValue: this.suggestedValue?.value,
        rejectReason: this.rejectReason?.value,
        rejectReason2: this.rejectReason2?.value,
        approvalType: this.approvalType?.value,
        pmuSuggestedValue2: this.pmuSuggestedValue2?.value,
        ulbComment: this.ulbComment?.value,
        ulbValue: this.ulbValue?.value,
        formFieldType: this.formFieldType?.value
      },
      width: '800px',
      // maxWidth: '100%',
      maxHeight: '90vh'
    });

    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.onReject.emit(res);
      }
    })
  }

  openUlbActionDialog() {
    console.log('openUlbActionDialog')
    const dialog = this.matDialog.open(UlbActionPopupComponent, {
      data: {
        title: this.title,
        subTitle: this.subTitle,
        canSuggestValue: this.canSuggestValue,
        suggestedValue: this.suggestedValue?.value,
        rejectReason: this.rejectReason?.value,
        ulbComment: this.ulbComment?.value,
        formFieldType: this.formFieldType?.value,
        date: this.date?.value,
        originalValue: this.originalValue?.value,
        ulbValue: this.ulbValue?.value,
        approvalType: this.approvalType?.value
      },
      width: '700px',
      maxHeight: '90vh'
    });

    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.onReject.emit(res);
      }
    })
  }


}
