import { Component, ViewChild, inject } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { ReviewSubmitComponent } from '../../../features/xvi-fc-form/review-submit/review-submit.component';
import { FormBuilder } from '@angular/forms';
import { XviFcService } from '../../../core/services/xvi-fc.service';
// import { tabsJson } from '../../../features/xvi-fc-form/xviFormJsonApi';
import { UserUtility } from '../../../core/util/user/user';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    MaterialModule,
    ReviewSubmitComponent,
  ],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {
  formStatus!: string;
  isLoader: boolean = false;
  submittedFormStatuses = ['UNDER_REVIEW_BY_STATE'];
  form: any;
  ulbId!: string;
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  tabs: any[] = [];
  totalTabs: any;
  formSaveLoader: boolean = false;

  constructor(private fb: FormBuilder,
    public service: XviFcService,
    // public formService: DynamicFormService,
    private route: ActivatedRoute,) {
  }

  productId!: string;

  ngOnInit() {
    this.ulbId = <string>this.route.snapshot.paramMap.get('ulbId');
    if (this.ulbId) {
      this.onLoad();
    }
  }

  get isFormEditable() {
    // return !this.submittedFormStatuses.includes(this.formStatus);
    return false;
  }

  get enableButton() {
    return ['UNDER_REVIEW_BY_STATE'].includes(this.formStatus);
  }
  onLoad() {

    this.isLoader = true;
    this.service.getUlbForm(this.ulbId).subscribe({
      next: (res: any) => {
        this.formStatus = res.data.formStatus;
        this.tabs = res?.data?.tabs;
        this.totalTabs = this.tabs.length;

        this.isLoader = false;
      }, error: () => {
        this.isLoader = false;
      }
    });
  }

  onSubmit(status: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to approve this form? Once approved, 
      it will be sent to XVI FC for Review.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.formSaveLoader = true;
        const formData = '';
        // this.service.submitUlbForm(this.ulbId, formData).subscribe((res) => {
        this.service.submitFormStatus(this.ulbId, formData).subscribe({
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

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Cancel the action
        Swal.fire(
          'Cancelled',
          'Your action has been cancelled.',
          'error'
        );
      }
    });
  }

  handleHttpError(error: any) {
    Swal.fire(
      'Error',
      error.message || 'Something went wrong! Please try again',
      'error'
    );
    this.formSaveLoader = false;
  }

}
