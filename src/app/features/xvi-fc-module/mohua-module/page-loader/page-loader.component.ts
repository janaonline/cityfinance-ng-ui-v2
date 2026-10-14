import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** A centered spinner for a whole MoHUA page while it loads. The label is read out by screen readers. */
@Component({
  selector: 'app-mohua-page-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="pl" role="status" aria-live="polite">
      <mat-progress-spinner mode="indeterminate" [diameter]="44" [attr.aria-label]="label()" />
      <span class="pl__label">{{ label() }}</span>
    </div>
  `,
  styleUrl: './page-loader.component.scss',
})
export class MohuaPageLoaderComponent {
  readonly label = input('Loading');
}
