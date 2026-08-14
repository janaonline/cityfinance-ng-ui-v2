import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { FAQ_SECTIONS, FaqSection } from './faq-questions';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatExpansionModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  protected readonly sections: readonly FaqSection[] = FAQ_SECTIONS;
}
