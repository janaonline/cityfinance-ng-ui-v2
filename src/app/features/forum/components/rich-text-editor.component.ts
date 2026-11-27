import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { MarkdownComponent } from '../markdown/markdown.component';

interface EditorTool {
  label: string;
  title: string;
  before: string;
  after: string;
  fallback: string;
  mode: 'wrap' | 'prefix' | 'numbered';
}

const TOOLS: EditorTool[] = [
  { label: 'B', title: 'Bold', before: '**', after: '**', fallback: 'bold text', mode: 'wrap' },
  { label: 'I', title: 'Italic', before: '*', after: '*', fallback: 'italic text', mode: 'wrap' },
  {
    label: 'H2',
    title: 'Heading 2',
    before: '## ',
    after: '',
    fallback: 'Heading',
    mode: 'prefix',
  },
  {
    label: 'H3',
    title: 'Heading 3',
    before: '### ',
    after: '',
    fallback: 'Heading',
    mode: 'prefix',
  },
  {
    label: 'Bullets',
    title: 'Bulleted list',
    before: '- ',
    after: '',
    fallback: 'List item',
    mode: 'prefix',
  },
  {
    label: '1. List',
    title: 'Numbered list',
    before: '1. ',
    after: '',
    fallback: 'List item',
    mode: 'numbered',
  },
  { label: 'Quote', title: 'Quote', before: '> ', after: '', fallback: 'Quote', mode: 'prefix' },
  { label: '</>', title: 'Inline code', before: '`', after: '`', fallback: 'code', mode: 'wrap' },
  {
    label: 'Link',
    title: 'Link',
    before: '[',
    after: '](https://)',
    fallback: 'link text',
    mode: 'wrap',
  },
];

/** Markdown textarea with a formatting toolbar and a write / preview toggle. */
@Component({
  selector: 'app-forum-rich-text-editor',
  standalone: true,
  imports: [MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="editor">
      <div class="editor-toolbar" role="toolbar" aria-label="Formatting tools">
        @for (tool of tools; track tool.title) {
          <button
            type="button"
            [title]="tool.title"
            [attr.aria-label]="tool.title"
            [disabled]="disabled()"
            (click)="apply(tool)"
          >
            {{ tool.label }}
          </button>
        }
        <button
          class="preview-toggle"
          type="button"
          [disabled]="disabled()"
          (click)="preview.set(!preview())"
        >
          {{ preview() ? 'Write' : 'Preview' }}
        </button>
      </div>
      @if (preview()) {
        <div class="editor-preview"><app-forum-markdown [source]="value()" /></div>
      } @else {
        <textarea
          #field
          [value]="value()"
          (input)="onInput(field.value)"
          [disabled]="disabled()"
          [attr.minlength]="minLength()"
          [attr.maxlength]="maxLength()"
          [rows]="rows()"
          [placeholder]="placeholder()"
          [attr.aria-label]="ariaLabel()"
        ></textarea>
      }
      @if (toolError()) {
        <span class="field-error" role="alert">{{ toolError() }}</span>
      }
      <small class="editor-count"
        >{{ value().length.toLocaleString() }} /
        {{ maxLength().toLocaleString() }} characters</small
      >
    </div>
  `,
})
export class RichTextEditorComponent {
  readonly value = model('');
  readonly minLength = input(0);
  readonly maxLength = input(20000);
  readonly rows = input(10);
  readonly placeholder = input('');
  readonly ariaLabel = input('Text');
  /** Locks the textarea and toolbar, e.g. while the parent form is submitting. */
  readonly disabled = input(false);

  protected readonly tools = TOOLS;
  protected readonly preview = signal(false);
  /** Set when a toolbar edit was refused (for example, it would exceed `maxLength`). */
  protected readonly toolError = signal('');
  private readonly field = viewChild<ElementRef<HTMLTextAreaElement>>('field');

  /** Returns the editor to write mode (used by parents after a successful submit). */
  resetPreview(): void {
    this.preview.set(false);
  }

  protected onInput(text: string): void {
    this.toolError.set('');
    this.value.set(text);
  }

  protected apply(tool: EditorTool): void {
    if (this.disabled()) return;
    const el = this.field()?.nativeElement;
    const current = this.value();
    let start = el?.selectionStart ?? current.length;
    let end = el?.selectionEnd ?? current.length;
    if (tool.mode !== 'wrap') {
      // Block tools (headings, lists, quotes) only render at the start of a line, so they act on
      // whole lines: widen the range to the start of the first line and the end of the last one.
      // A selection that ends right after a line break stops at the previous line.
      start = start === 0 ? 0 : current.lastIndexOf('\n', start - 1) + 1;
      const endAnchor = end > start && current[end - 1] === '\n' ? end - 1 : end;
      const lineEnd = current.indexOf('\n', endAnchor);
      end = lineEnd === -1 ? current.length : lineEnd;
    }
    const selected = current.slice(start, end) || tool.fallback;
    const formatted =
      tool.mode === 'prefix'
        ? selected
            .split('\n')
            .map((line) => `${tool.before}${line}`)
            .join('\n')
        : tool.mode === 'numbered'
          ? selected
              .split('\n')
              .map((line, index) => `${index + 1}. ${line}`)
              .join('\n')
          : `${tool.before}${selected}${tool.after}`;
    const proposed = `${current.slice(0, start)}${formatted}${current.slice(end)}`;
    if (proposed.length > this.maxLength()) {
      this.toolError.set(
        `${tool.title} would take the text over the ${this.maxLength().toLocaleString()}-character limit.`,
      );
      return;
    }
    this.toolError.set('');
    this.value.set(proposed);
    if (el) {
      // Wait for the textarea to re-render with the new value before restoring the selection.
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start, start + formatted.length);
      });
    }
  }
}
