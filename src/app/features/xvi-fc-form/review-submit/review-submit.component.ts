import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { MatStepper } from '@angular/material/stepper';
import { ToStorageUrlPipe } from '../../../core/pipes/to-storage-url.pipe';
import { Title , Meta} from '@angular/platform-browser';

@Component({
    selector: 'app-review-submit',
    imports: [MaterialModule, ToStorageUrlPipe],
    templateUrl: './review-submit.component.html',
    styleUrl: './review-submit.component.scss'
})
export class ReviewSubmitComponent implements OnInit {
  @Input() fields!: any[];
  @Input() group!: FormGroup;
  @Input() isFormEditable = false;
  collapsed = false;
  panelOpenState = true;
  @Input() stepper: MatStepper | undefined;

  constructor(
    private titleService : Title,
    private metaService : Meta
  ) {}
  ngOnInit() {
    this.titleService.setTitle('Review & Submit - XVIFC Form | City Finance');

    this.metaService.updateTag({
      name: 'description',
      content: 'Review and submit your XVIFC application. Verify your details before final submission for a seamless experience.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'City Finance, review, submit, application, finance form, verification, submission'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow'
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'Review & Submit - XVIFC Form | City Finance'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Easily review and submit your City Finance application. Ensure all your information is correct before submitting.'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://cityfinance.in/fc/xvifc-form'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });
  }

  printPage() {
    window.print();
  }

  getTableGroup(fieldKey: any, i = 0, rowKey: string, j = 0): FormGroup {
    return (
      ((this.group.get(fieldKey) as FormArray).controls[i] as FormGroup).get(rowKey) as FormArray
    ).controls[j] as FormGroup;
  }

  editStep(index: number) {
    if (this.stepper) this.stepper.selectedIndex = index;
  }

  isFormValid(tabKey: string): boolean {
    // console.log('this.form.get()?.valid',this.form.get('demographicData')?.valid);
    return !this.isFormEditable || (this.group.get(tabKey)?.valid as boolean);
  }

  checkReason(question: any): string {
    const option = question?.options.find((x: { id: string }) => x?.id === question.value);
    return option && option.showInputBox && question.reason === '' ? 'N/A' : question.reason;
  }
}
