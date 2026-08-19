import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImageLightboxDialogComponent, ImageLightboxDialogData } from './image-lightbox-dialog/image-lightbox-dialog.component';

const IMAGE_BASE = 'assets/images/document-upload-guide';

@Component({
  selector: 'app-document-upload-guide',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './document-upload-guide.component.html',
  styleUrl: './document-upload-guide.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentUploadGuideComponent {
  private readonly dialog = inject(MatDialog);

  protected readonly correctExample: ImageLightboxDialogData = {
    src: `${IMAGE_BASE}/balance-sheet-correct-example.png`,
    alt: "Nagar Nigam Agra's Balance Sheet, correctly formatted and signed",
    caption: "Nagar Nigam Agra's Balance Sheet: correct type, correct financial year, clearly signed.",
  };

  protected readonly fadedScanExample: ImageLightboxDialogData = {
    src: `${IMAGE_BASE}/scan-faded-example.png`,
    alt: 'A faded, hard-to-read scanned document',
    caption: 'This scan is faded and the text is hard to read. Blurred or low-quality scans like this will be flagged.',
  };

  protected readonly blurredScanExample: ImageLightboxDialogData = {
    src: `${IMAGE_BASE}/scan-blurred-example.png`,
    alt: 'A scanned balance sheet with blurred and faded text',
    caption: 'The text in this scan is blurred and faded in places. Always make sure your scan is sharp and fully legible before uploading.',
  };

  openLightbox(data: ImageLightboxDialogData): void {
    this.dialog.open(ImageLightboxDialogComponent, {
      data,
      panelClass: 'image-lightbox-panel',
      backdropClass: 'image-lightbox-backdrop',
      maxWidth: '95vw',
      maxHeight: '95vh',
    });
  }
}
