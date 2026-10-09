import { Directive, ElementRef, OnDestroy, OnInit, effect, inject, input } from '@angular/core';

const REVEAL_FALLBACK_MS = 4000;
const COUNT_UP_MS = 1000;
const NUMBER_PATTERN = /\d[\d,]*(\.\d+)?/;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Fades/slides the host in the first time it scrolls into view. Never leaves content hidden:
 *  reduced-motion, no IntersectionObserver, or a 4s fallback all reveal it immediately. */
@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  readonly revealDelay = input(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;
  private fallbackTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.host.classList.add('rv');
    this.host.style.setProperty('--d', `${this.revealDelay()}ms`);

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      this.show();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) this.show();
      },
      { threshold: 0.12 },
    );
    this.observer.observe(this.host);
    this.fallbackTimer = setTimeout(() => this.show(), REVEAL_FALLBACK_MS);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private show(): void {
    this.host.classList.add('in');
    this.cleanup();
  }

  private cleanup(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    clearTimeout(this.fallbackTimer);
  }
}

/** Sets the host's text to `appCountUp` and, the first time it scrolls into view, counts the first
 *  number in it up from 0 (keeping any ₹ / cr / % text around it). Text changes after that apply as-is. */
@Directive({ selector: '[appCountUp]', standalone: true })
export class CountUpDirective implements OnDestroy {
  readonly appCountUp = input.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;
  private frame = 0;
  private armed = false;
  private played = false;

  constructor() {
    effect(() => {
      const text = this.appCountUp();
      const match = NUMBER_PATTERN.exec(text);

      if (this.played || !match || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
        this.host.textContent = text;
        return;
      }

      this.host.textContent = text.replace(match[0], '0');
      if (this.armed) return;
      this.armed = true;
      this.observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.observer?.disconnect();
          this.play(this.appCountUp());
        }
      });
      this.observer.observe(this.host);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }

  private play(text: string): void {
    const match = NUMBER_PATTERN.exec(text);
    if (!match) {
      this.host.textContent = text;
      return;
    }

    const end = parseFloat(match[0].replace(/,/g, ''));
    const decimals = (match[1] ?? '').length;
    const start = performance.now();
    this.played = true;

    const step = (now: number): void => {
      const progress = Math.min((now - start) / COUNT_UP_MS, 1);
      if (progress >= 1) {
        this.host.textContent = this.appCountUp();
        return;
      }
      const value = end * (1 - Math.pow(1 - progress, 3));
      const shown = value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      this.host.textContent = text.replace(match[0], shown);
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }
}
