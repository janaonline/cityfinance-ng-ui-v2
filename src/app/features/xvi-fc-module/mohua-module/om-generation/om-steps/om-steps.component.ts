import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface OmStep {
  title: string;
  note: string;
}

const STEPS: readonly OmStep[] = [
  { title: 'Claim Letter Review', note: 'Letter verified by MoHUA' },
  { title: 'Generate OM', note: 'One OM for each Claim Letter' },
  { title: 'Upload Signed OM', note: 'After e-Office sign-off' },
];

/** The three OM steps, the current one highlighted (a header only, not navigation). */
@Component({
  selector: 'app-om-steps',
  template: `
    <ol class="om-steps" aria-label="OM steps">
      @for (step of steps; track step.title; let i = $index) {
        <li class="om-step" [class.om-step--current]="i + 1 === current()" [attr.aria-current]="i + 1 === current() ? 'step' : null">
          <span class="om-step__eyebrow">Step {{ i + 1 }}{{ i + 1 === current() ? ' — current' : '' }}</span>
          <span class="om-step__title">{{ step.title }}</span>
          <span class="om-step__note">{{ step.note }}</span>
        </li>
      }
    </ol>
  `,
  styles: `
    .om-steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin: 0 0 1.25rem;
      padding: 0;
      list-style: none;
      border: 1px solid #e3e8ea;
      border-radius: 10px;
      background: #fff;
      overflow: hidden;
    }
    .om-step {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      padding: 0.7rem 1rem;
      border-bottom: 3px solid transparent;
      color: #5b6b73;
      font-size: 0.75rem;
    }
    .om-step + .om-step {
      border-left: 1px solid #e3e8ea;
    }
    .om-step--current {
      border-bottom-color: #0f5b4a;
      background: #f1f8f4;
      color: #0f5b4a;
    }
    .om-step__eyebrow {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .om-step__title {
      font-size: 0.85rem;
      font-weight: 700;
    }
    @media (max-width: 575.98px) {
      .om-steps {
        grid-template-columns: 1fr;
      }
      .om-step + .om-step {
        border-left: 0;
        border-top: 1px solid #e3e8ea;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmStepsComponent {
  readonly current = input.required<1 | 2 | 3>();
  readonly steps = STEPS;
}
