import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { FAQ_PAGE_COPY, FAQ_SECTIONS, FaqSection } from './faq-questions';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatExpansionModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  private readonly xvifcService = inject(XvifcModuleService);

  protected readonly isState = computed(() => this.xvifcService.role() === 'STATE');

  /** ADC users see only the shared sections (Logging In) — no ULB- or State-DMA-specific ones. */
  protected readonly isAdc = computed(() => this.xvifcService.role() === 'STATE_ADC');

  protected readonly subtitle = computed(() =>
    this.isAdc()
      ? 'Common questions about signing in and using the 16th Finance Commission portal.'
      : (this.isState() ? FAQ_PAGE_COPY.STATE : FAQ_PAGE_COPY.ULB).subtitle,
  );

  protected readonly sections = computed<readonly FaqSection[]>(() => {
    const role = this.xvifcService.role();
    return FAQ_SECTIONS.filter((section) => !section.role || section.role === role);
  });
}
