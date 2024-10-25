import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { ReviewSubmitComponent } from '../../../features/xvi-fc-form/review-submit/review-submit.component';
import { FormBuilder } from '@angular/forms';
import { XviFcService } from '../../../core/services/xvi-fc.service';
// import { tabsJson } from '../../../features/xvi-fc-form/xviFormJsonApi';
import { UserUtility } from '../../../core/util/user/user';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApproveRejectFormService } from '../approve-reject-form.service';
import { FORM_STATUSES } from '../../../core/constants/statuses';
import { first } from 'rxjs';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [MaterialModule, ReviewSubmitComponent, RouterModule],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss',
})
export class PreviewComponent implements OnInit {
  formStatus!: string;
  isLoader: boolean = false;
  submittedFormStatuses = ['UNDER_REVIEW_BY_STATE'];
  form: any;
  ulbId!: string;
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  tabs: any[] = [];
  totalTabs: any;
  formSaveLoader: boolean = false;

  constructor(
    private fb: FormBuilder,
    public service: XviFcService,
    public approveRejectService: ApproveRejectFormService,
    // public formService: DynamicFormService,
    private route: ActivatedRoute,
  ) { }

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
    return this.isReviewable(this.formStatus);
  }

  isReviewable(formStatus: string): boolean {
    const status = FORM_STATUSES[formStatus] || '';
    if (status && status.roles && status.roles.includes(this.loggedInUserDetails.role)) {
      return true;
    }
    return false;
  }

  onLoad() {
    this.isLoader = true;
    this.service.getUlbForm(this.ulbId).subscribe({
      next: (res: any) => {
        this.formStatus = res.data.formStatus;
        this.tabs = res?.data?.tabs;
        this.totalTabs = this.tabs.length;

        this.isLoader = false;
      },
      error: () => {
        this.isLoader = false;
      },
    });
  }

  onSubmit(statusType: string) {
    this.approveRejectService.openDialogue(statusType, [this.ulbId]);

    this.approveRejectService.isDataSaved.pipe(first()).subscribe((success) => {
      if (success) {
        this.onLoad();
      }
      // console.log('success: ', success);
    });
  }
}
