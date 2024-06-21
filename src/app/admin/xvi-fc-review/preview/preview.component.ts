import { Component } from '@angular/core';
import { XviFcFormComponent } from '../../../features/xvi-fc-form/xvi-fc-form.component';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';
import { MaterialModule } from '../../../material.module';
import { PercentprogressPipe } from '../../../core/pipes/percentprogress.pipe';
import { AlreadyUpdatedUrlPipe } from '../../../core/pipes/already-updated-url.pipe';
import { YearwiseFilesComponent } from '../../../features/xvi-fc-form/yearwise-files/yearwise-files.component';
import { AccountingPracticeComponent } from '../../../features/xvi-fc-form/accounting-practice/accounting-practice.component';
import { ReviewSubmitComponent } from '../../../features/xvi-fc-form/review-submit/review-submit.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    DynamicFormComponent,
    MaterialModule,

    PercentprogressPipe,
    AlreadyUpdatedUrlPipe,
    LoaderComponent,

    YearwiseFilesComponent,
    AccountingPracticeComponent,
    ReviewSubmitComponent,
    XviFcFormComponent
  ],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {

}
