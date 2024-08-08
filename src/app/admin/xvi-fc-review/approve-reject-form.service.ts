import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { XviFcService } from '../../core/services/xvi-fc.service';
import { Subject } from 'rxjs';
import { UserUtility } from '../../core/util/user/user';

@Injectable({
  providedIn: 'root',
})
export class ApproveRejectFormService {
  isDataSaved: Subject<boolean> = new Subject();
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  isLoader: boolean = true;
  isLoader1: boolean = false;
  loggedInUserType: any;
  user!: IUserLoggedInDetails | null;
  isLoggedIn: boolean = false;
  USER_TYPE = USER_TYPE;
  currentUserRole = this.loggedInUserDetails.role;
  userData = this.loggedInUserDetails;

  constructor(public service: XviFcService) {}

  openDialogue(statusType: string, ulbs: string[]) {
    type LoginFormResult = {
      reason: string;
    };

    let reasonInput: HTMLInputElement;
    // let passwordInput: HTMLInputElement
    let html = '';

    // if (statusType === 'reject') {
    //   if(this.userData.role === 'XVIFC'){
    //     alert('Role model');
    //   }
    //   html += `<p>Are you sure you want to return this form? Once returned, it will be sent to the ULB for resubmission.</p>`;
    //   html += `<textarea type="text" id="reason" class="swal2-input" placeholder="Reason"></textarea>`;
    // } else {
    //   html = `<p>Are you sure you want to approve this form? Once approved,
    //     it will be sent to XVI FC for Review.</p>`;
    // }

    if (statusType === 'reject') {
      if (this.userData?.role === 'XVIFC') {
        html += `<p>Are you sure you want to return this form?</p>`;
      } else {
        html += `<p>Are you sure you want to return this form? Once returned, it will be sent to the ULB for resubmission.</p>`;
      }
      html += `<textarea type="text" id="reason" class="swal2-input mt-4" placeholder="Reason"></textarea>`;
    } else {
      if (this.userData?.role === 'XVIFC') {
        html += `<p>Are you sure you want to approve this form?</p>`;
      } else {
        html += `<p>Are you sure you want to approve this form? Once approved, it will be sent to XVI FC for Review.</p>`;
      }
    }

    Swal.fire<LoginFormResult>({
      title: 'Confirmation?',
      html,
      confirmButtonText: 'Submit',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'No, cancel!',
      focusConfirm: false,
      didOpen: () => {
        if (statusType === 'reject') {
          const popup = Swal.getPopup()!;
          reasonInput = popup.querySelector('#reason') as HTMLInputElement;
          // passwordInput = popup.querySelector('#password') as HTMLInputElement
          reasonInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm();
          // passwordInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
        }
      },
      preConfirm: () => {
        let reason = '';
        let validData = true;
        if (statusType === 'reject') {
          reason = reasonInput.value;
          // const password = passwordInput.value
          if (!reason) {
            Swal.showValidationMessage(`Please enter reason`);
            validData = false;
          }
        }
        // return { reason }
        if (validData) {
          this.submitStatus(ulbs, statusType, reason);
        }
      },
    });
  }

  submitStatus(ulbs: string[], statusType: string, reason: string) {
    // this.formSaveLoader = true;
    const formData = {
      ulbs,
      ...(statusType === 'reject' && {
        reject: true,
        rejectMessage: reason,
      }),
    };
    // this.isDataSaved.next(true);
    // console.log('formData', formData);
    // return;

    this.service.submitFormStatus(statusType, formData).subscribe({
      next: (res) => {
        Swal.fire('Done!', 'Your action has been confirmed.', 'success');
        this.isDataSaved.next(true);
      },
      error: (error: any) => {
        this.handleHttpError(error);
      },
    });
  }

  handleHttpError(error: any) {
    Swal.fire('Error', error.message || 'Something went wrong! Please try again', 'error');
  }
}
