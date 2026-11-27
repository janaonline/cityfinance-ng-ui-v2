import { TestBed } from '@angular/core/testing';
import { RichTextEditorComponent } from './rich-text-editor.component';

describe('RichTextEditorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RichTextEditorComponent] });
  });

  function render(value: string, maxLength = 20000) {
    const fixture = TestBed.createComponent(RichTextEditorComponent);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('maxLength', maxLength);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
    const tool = (title: string) =>
      el.querySelector<HTMLButtonElement>(`button[title="${title}"]`)!;
    return { fixture, el, textarea, tool };
  }

  it('applies a block tool to the whole line, not at the caret', () => {
    const { fixture, textarea, tool } = render('Existing text');
    textarea.setSelectionRange(13, 13);
    tool('Heading 2').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('## Existing text');
  });

  it('formats every selected line and leaves other lines alone', () => {
    const { fixture, textarea, tool } = render('intro\none\ntwo\noutro');
    textarea.setSelectionRange(8, 11); // from inside "one" to inside "two"
    tool('Bulleted list').click();
    expect(fixture.componentInstance.value()).toBe('intro\n- one\n- two\noutro');
  });

  it('keeps inline tools on the selection only', () => {
    const { fixture, textarea, tool } = render('make this bold');
    textarea.setSelectionRange(10, 14);
    tool('Bold').click();
    expect(fixture.componentInstance.value()).toBe('make this **bold**');
  });

  it('refuses a toolbar edit that would exceed maxLength and says why', () => {
    const { fixture, el, tool } = render('1234567890', 12);
    tool('Bold').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('1234567890');
    expect(el.querySelector('.field-error')?.textContent).toContain('12-character limit');
  });
});
