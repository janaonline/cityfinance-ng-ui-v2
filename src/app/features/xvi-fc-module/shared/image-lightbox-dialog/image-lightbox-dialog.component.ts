import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ImageLightboxDialogData {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Borderless image lightbox opened from the Document Upload Guide's example scans.
 * MatDialog already gives us the centered overlay, dark backdrop, Escape-to-close,
 * backdrop-click-to-close, and background scroll lock for free — see the
 * `.image-lightbox-panel` overrides in `material-custom.scss` for the borderless look
 * (CDK overlay content renders outside this component's view, so those rules can't
 * live in this component's own stylesheet).
 */
@Component({
  selector: 'app-image-lightbox-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  template: `
    <button
      type="button"
      class="lightbox-close"
      (click)="close()"
      aria-label="Close image preview"
    >
      <mat-icon>close</mat-icon>
    </button>
    <img class="lightbox-image" [src]="data.src" [alt]="data.alt" />
    @if (data.caption) {
      <p class="lightbox-caption">{{ data.caption }}</p>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 90vw;
      max-height: 90vh;
    }

    .lightbox-image {
      display: block;
      max-width: 90vw;
      max-height: 80vh;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 0.5rem;
    }

    .lightbox-caption {
      margin: 0.75rem 0 0;
      color: #ffffff;
      font-size: 0.85rem;
      text-align: center;
      max-width: 60ch;
    }

    .lightbox-close {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: none;
      background: #ffffff;
      color: #0f172a;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      &:hover {
        background: #f1f5f9;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLightboxDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ImageLightboxDialogComponent>>(MatDialogRef);
  readonly data = inject<ImageLightboxDialogData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
