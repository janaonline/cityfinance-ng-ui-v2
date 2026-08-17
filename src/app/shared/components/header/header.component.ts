import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutMetricsService } from '../../../core/services/layout-metrics.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly layoutMetrics = inject(LayoutMetricsService);

  size: string = 'rg';
  textSize = ['sm', 'rg', 'lg'];
  currentTextSize: string = 'rg';
  constructor() {}

  ngAfterViewInit(): void {
    // Keeps --app-header-height in sync with this element's real rendered height (breakpoint
    // changes, font-size toggles, window resize) — consumed by calc(100vh - ...) sidebars/panels
    // elsewhere in the app instead of a hardcoded px value.
    this.layoutMetrics.trackHeaderElement(this.elementRef, this.destroyRef);
  }

  public setFontSize(size: string): void {
    const elem = document.documentElement;

    this.textSize.forEach((item) => elem.classList.remove(item));
    elem.classList.add(size);
    this.currentTextSize = size;
    localStorage.setItem('myLSkey', JSON.stringify({ currentTextSize: size }));
  }

  public scrollToMainContent(): void {
    const element = document.getElementById('main-content');
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}
