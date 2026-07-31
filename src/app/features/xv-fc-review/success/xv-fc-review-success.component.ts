import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { XvFcDataReviewService } from '../xv-fc-data-review.service';

@Component({
  selector: 'app-xv-fc-review-success',
  standalone: true,
  imports: [CommonModule, MaterialModule, DatePipe],
  templateUrl: './xv-fc-review-success.component.html',
  styleUrl: './xv-fc-review-success.component.scss',
})
export class XvFcReviewSuccessComponent {
  readonly service = inject(XvFcDataReviewService);

  @Input({ required: true }) fy!: string;
  @Output() backToReview = new EventEmitter<void>();

  downloading = false;

  get detail() {
    return this.service.fyDetail();
  }

  get flagCount(): number {
    return this.detail?.lineItems.filter((i) => i.flagged).length ?? 0;
  }

  downloadAcknowledgement() {
    this.downloading = true;
    this.service.downloadPdf(this.fy, 'whole').subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `XV-FC-Review-${this.fy}-acknowledgement.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloading = false;
      },
      error: () => {
        this.downloading = false;
      },
    });
  }

  onBack() {
    this.backToReview.emit();
  }
}
