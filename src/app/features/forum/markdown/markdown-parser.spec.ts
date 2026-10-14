import { parseInline, parseMarkdown } from './markdown-parser';

describe('markdown parser', () => {
  it('parses headings, quotes and paragraphs, skipping blank lines', () => {
    expect(parseMarkdown('# A\n## B\n### C\n> q\n\nplain')).toEqual([
      { type: 'heading', level: 1, inlines: [{ type: 'text', text: 'A' }] },
      { type: 'heading', level: 2, inlines: [{ type: 'text', text: 'B' }] },
      { type: 'heading', level: 3, inlines: [{ type: 'text', text: 'C' }] },
      { type: 'blockquote', inlines: [{ type: 'text', text: 'q' }] },
      { type: 'paragraph', inlines: [{ type: 'text', text: 'plain' }] },
    ]);
  });

  it('parses inline strong, em, code and http(s) links', () => {
    expect(parseInline('a **b** *c* `d` [e](https://x.test/p)')).toEqual([
      { type: 'text', text: 'a ' },
      { type: 'strong', text: 'b' },
      { type: 'text', text: ' ' },
      { type: 'em', text: 'c' },
      { type: 'text', text: ' ' },
      { type: 'code', text: 'd' },
      { type: 'text', text: ' ' },
      { type: 'link', text: 'e', href: 'https://x.test/p' },
    ]);
  });

  it('never turns non-http links into links and keeps HTML as plain text', () => {
    const inlines = parseInline('[x](javascript:alert(1)) <img src=x onerror=alert(1)>');
    expect(inlines.every((i) => i.type === 'text')).toBeTrue();
    const [block] = parseMarkdown('<script>alert(1)</script>');
    expect(block).toEqual({
      type: 'paragraph',
      inlines: [{ type: 'text', text: '<script>alert(1)</script>' }],
    });
  });

  it('groups bullet lists', () => {
    const [block] = parseMarkdown('- one\n* two');
    expect(block.type).toBe('ul');
    if (block.type === 'ul') expect(block.items.length).toBe(2);
  });

  it('uses the first number as the ordered list start', () => {
    const [block] = parseMarkdown('3. three\n4. four');
    expect(block.type).toBe('ol');
    if (block.type === 'ol') {
      expect(block.start).toBe(3);
      expect(block.items.length).toBe(2);
    }
  });

  it('starts a new ordered list after a blank line with its own start value', () => {
    const blocks = parseMarkdown('1. a\n2. b\n\n3. c');
    expect(blocks.length).toBe(2);
    const second = blocks[1];
    expect(second.type === 'ol' && second.start).toBe(3);
  });

  it('switches between bullet and ordered lists', () => {
    const blocks = parseMarkdown('- a\n1. b\n- c');
    expect(blocks.map((b) => b.type)).toEqual(['ul', 'ol', 'ul']);
  });

  it('handles CRLF and empty input', () => {
    expect(parseMarkdown('a\r\nb').length).toBe(2);
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown(null)).toEqual([]);
  });
});
