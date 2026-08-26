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

  protected readonly subtitle = computed(() => (this.isState() ? FAQ_PAGE_COPY.STATE : FAQ_PAGE_COPY.ULB).subtitle);

  protected readonly sections = computed<readonly FaqSection[]>(() => {
    const role = this.xvifcService.role();
    return FAQ_SECTIONS.filter((section) => !section.role || section.role === role);
  });
}
