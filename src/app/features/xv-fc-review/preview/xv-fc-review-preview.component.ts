import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { XvFcDataReviewService } from '../xv-fc-data-review.service';
import { XvFcCurrencyUnit, XvFcFinalAction } from '../models/xv-fc-review.model';
import { formatXvFcAmount, groupXvFcLineItems } from '../xv-fc-review-format.util';

@Component({
  selector: 'app-xv-fc-review-preview',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './xv-fc-review-preview.component.html',
  styleUrl: './xv-fc-review-preview.component.scss',
})
export class XvFcReviewPreviewComponent {
  readonly service = inject(XvFcDataReviewService);

  @Input({ required: true }) fy!: string;
  @Input({ required: true }) unit!: XvFcCurrencyUnit;
  @Input({ required: true }) action!: XvFcFinalAction;
  @Input() submitting = false;

  @Output() back = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  get detail() {
    return this.service.fyDetail();
  }

  get lineItemGroups() {
    return groupXvFcLineItems(this.detail?.lineItems ?? []);
  }

  get totalItems(): number {
    return this.detail?.lineItems.length ?? 0;
  }

  get flagCount(): number {
    return this.detail?.lineItems.filter((i) => i.flagged).length ?? 0;
  }

  /** One shared supporting document for the whole FY — covers every flagged line item. */
  get commonSupportingDocument() {
    return this.detail?.supportingDocument ?? null;
  }

  formatAmount(amountInWholeRupees: number | null): string {
    return formatXvFcAmount(amountInWholeRupees, this.unit, 'whole');
  }

  onBack() {
    this.back.emit();
  }

  onConfirm() {
    this.confirmed.emit();
  }
}
