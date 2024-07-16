import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { XviFcService } from '../../core/services/xvi-fc.service';

@Injectable({
  providedIn: 'root'
})
export class ApproveRejectFormService {

  constructor(
    public service: XviFcService,
  ) { }

  openDialogue(statusType: string, ulbs: string[]) {
    type LoginFormResult = {
      reason: string
    }

    let reasonInput: HTMLInputElement
    // let passwordInput: HTMLInputElement
    let html = '';

    if (statusType === 'reject') {
      html += `<p>Are you sure you want to approve this form? Once approved, 
        it will be sent to XVI FC for Review.</p>`;
      html += `<textarea type="text" id="reason" class="swal2-input" placeholder="Reason"></textarea>`;
    } else {
      html = `<p>Are you sure you want to approve this form? Once approved, 
        it will be sent to XVI FC for Review.</p>`;
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
          const popup = Swal.getPopup()!
          reasonInput = popup.querySelector('#reason') as HTMLInputElement
          // passwordInput = popup.querySelector('#password') as HTMLInputElement
          reasonInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
          // passwordInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
        }
      },
      preConfirm: () => {
        let reason = '';
        let validData = true;
        if (statusType === 'reject') {
          reason = reasonInput.value
          // const password = passwordInput.value
          if (!reason) {
            Swal.showValidationMessage(`Please enter reason`);
            validData = false;
          }
        }
        // return { reason }
        if(validData) {
          this.submitStatus(ulbs, statusType, reason);
        }
      },
    })
  }

  submitStatus(ulbs: string[], statusType: string, reason: string) {
    // this.formSaveLoader = true;
    const formData = {
      ulbs,
      ...(statusType === 'reject' && {
        reject: true,
        rejectMessage: reason
      })
    };
    // console.log('formData', formData);
    // return;

    // this.service.submitUlbForm(this.ulbId, formData).subscribe((res) => {
    this.service.submitFormStatus(statusType, formData).subscribe({
      next: (res) => {
        Swal.fire(
          'Done!',
          'Your action has been confirmed.',
          'success'
        );
        // this.onLoad();
      }, error: (error: any) => {
        this.handleHttpError(error);
      }
    });
  }


  handleHttpError(error: any) {
    Swal.fire(
      'Error',
      error.message || 'Something went wrong! Please try again',
      'error'
    );
    // this.formSaveLoader = false;
  }
}
