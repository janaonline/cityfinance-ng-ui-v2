import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { MatStepper } from '@angular/material/stepper';
import { SignedUrlDirective } from '../../../core/directives/storage-url.directive';

@Component({
    selector: 'app-review-submit',
    imports: [MaterialModule, SignedUrlDirective],
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

  constructor() {}
  ngOnInit() {}

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
