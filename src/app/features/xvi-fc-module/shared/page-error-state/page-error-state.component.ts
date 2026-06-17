import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-error-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './page-error-state.component.html',
  styleUrl: './page-error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'We couldn\'t reach the server. Please check your connection and try again.';
  @Input() retryLabel = 'Retry';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
