import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface VideoWalkthroughDialogData {
  /** youtube-nocookie.com embed URL, e.g. `https://www.youtube-nocookie.com/embed/<id>`. */
  embedUrl: string;
  title: string;
}

/**
 * 16th FC video walkthrough dialog — NOT currently wired up anywhere (see overview.component.ts,
 * which uses a plain window.open() banner instead). This embeds a YouTube iframe, which only
 * loads where the deployment's Content-Security-Policy `frame-src` allows
 * https://www.youtube-nocookie.com — true today on dev/staging (fixed via their shared
 * /etc/nginx/snippets/cf-csp.conf), but NOT yet on production. Kept in the codebase, unused, until
 * production's CSP is updated too — wiring it back in before then would break the video specifically
 * in production while working everywhere else, since the frontend build is identical across
 * environments and has no way to know which CSP is live server-side.
 *
 * Modeled on ImageLightboxDialogComponent — same borderless-panel/dark-backdrop MatDialog
 * pattern, see `.video-walkthrough-panel` in `material-custom.scss` (the CDK overlay renders
 * outside this component's view, so those overrides can't live in this stylesheet).
 */
@Component({
  selector: 'app-video-walkthrough-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <button type="button" class="video-dialog-close" (click)="close()" aria-label="Close video">
      <i class="bi bi-x-lg" aria-hidden="true"></i>
    </button>
    <div class="video-dialog-frame">
      <iframe
        [src]="safeEmbedUrl"
        [title]="data.title"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: min(90vw, 960px);
    }

    .video-dialog-frame {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 0.5rem;
      overflow: hidden;
      background: #000;
    }

    .video-dialog-frame iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }

    .video-dialog-close {
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

      i {
        font-size: 1rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoWalkthroughDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<VideoWalkthroughDialogComponent>>(MatDialogRef);
  private readonly sanitizer = inject(DomSanitizer);
  readonly data = inject<VideoWalkthroughDialogData>(MAT_DIALOG_DATA);

  readonly safeEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.embedUrl);

  close(): void {
    this.dialogRef.close();
  }
}
