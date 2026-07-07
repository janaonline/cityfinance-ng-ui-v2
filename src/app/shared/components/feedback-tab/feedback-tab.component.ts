import { Component } from '@angular/core';

const FEEDBACK_FORM_URL = 'https://tally.so/r/44d28O';

@Component({
  selector: 'app-feedback-tab',
  standalone: true,
  templateUrl: './feedback-tab.component.html',
  styleUrl: './feedback-tab.component.scss',
})
export class FeedbackTabComponent {
  openFeedback(): void {
    window.open(FEEDBACK_FORM_URL, '_blank', 'noopener,noreferrer');
  }
}
