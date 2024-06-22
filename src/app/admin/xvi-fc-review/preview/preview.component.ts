import { Component, ViewChild, inject } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { ReviewSubmitComponent } from '../../../features/xvi-fc-form/review-submit/review-submit.component';
import { FormBuilder } from '@angular/forms';
import { XviFcService } from '../../../core/services/xvi-fc.service';
// import { tabsJson } from '../../../features/xvi-fc-form/xviFormJsonApi';
import { UserUtility } from '../../../core/util/user/user';
import { ActivatedRoute } from '@angular/router';

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
  submittedFormStatuses = ['SUBMITTED'];
  form: any;
  ulbId!: string;
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  tabs: any[] = [];
  totalTabs: any;

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
  onLoad() {

    this.isLoader = true;
    this.service.getUlbForm(this.ulbId).subscribe({
      next: (res: any) => {
        this.formStatus = res.data.formStatus;
        this.tabs = res?.data?.tabs;
        // this.tabs = tabsJson.data.tabs;
        this.totalTabs = this.tabs.length;

        this.isLoader = false;
      }, error: () => {
        this.isLoader = false;
      }
    });
  }


}
