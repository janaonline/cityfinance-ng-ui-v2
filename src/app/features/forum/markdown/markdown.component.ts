import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MdInline, parseMarkdown } from './markdown-parser';

/** Renders forum Markdown through Angular templates (no innerHTML). */
@Component({
  selector: 'app-forum-markdown',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #inline let-items>
      @for (part of items; track $index) {
        @switch (part.type) {
          @case ('strong') {
            <strong>{{ part.text }}</strong>
          }
          @case ('em') {
            <em>{{ part.text }}</em>
          }
          @case ('code') {
            <code>{{ part.text }}</code>
          }
          @case ('link') {
            <a [href]="part.href" target="_blank" rel="noreferrer noopener">{{ part.text }}</a>
          }
          @default {
            {{ part.text }}
          }
        }
      }
    </ng-template>

    <div class="rendered-content">
      @for (block of blocks(); track $index) {
        @switch (block.type) {
          @case ('heading') {
            @switch (block.level) {
              @case (1) {
                <h1>
                  <ng-container
                    *ngTemplateOutlet="inline; context: { $implicit: block.inlines }"
                  ></ng-container>
                </h1>
              }
              @case (2) {
                <h2>
                  <ng-container
                    *ngTemplateOutlet="inline; context: { $implicit: block.inlines }"
                  ></ng-container>
                </h2>
              }
              @default {
                <h3>
                  <ng-container
                    *ngTemplateOutlet="inline; context: { $implicit: block.inlines }"
                  ></ng-container>
                </h3>
              }
            }
          }
          @case ('blockquote') {
            <blockquote>
              <ng-container
                *ngTemplateOutlet="inline; context: { $implicit: block.inlines }"
              ></ng-container>
            </blockquote>
          }
          @case ('ul') {
            <ul>
              @for (item of asItems(block); track $index) {
                <li>
                  <ng-container
                    *ngTemplateOutlet="inline; context: { $implicit: item }"
                  ></ng-container>
                </li>
              }
            </ul>
          }
          @case ('ol') {
            <ol [attr.start]="asStart(block)">
              @for (item of asItems(block); track $index) {
                <li>
                  <ng-container
                    *ngTemplateOutlet="inline; context: { $implicit: item }"
                  ></ng-container>
                </li>
              }
            </ol>
          }
          @default {
            <p>
              <ng-container
                *ngTemplateOutlet="inline; context: { $implicit: asInlines(block) }"
              ></ng-container>
            </p>
          }
        }
      }
    </div>
  `,
})
export class MarkdownComponent {
  readonly source = input<string | null | undefined>('');
  protected readonly blocks = computed(() => parseMarkdown(this.source()));

  protected asItems(block: unknown): MdInline[][] {
    return (block as { items: MdInline[][] }).items;
  }

  protected asStart(block: unknown): number {
    return (block as { start: number }).start;
  }

  protected asInlines(block: unknown): MdInline[] {
    return (block as { inlines: MdInline[] }).inlines;
  }
}
