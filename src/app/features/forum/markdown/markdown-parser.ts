/**
 * Small Markdown parser ported from the Next forum `Markdown.tsx`.
 *
 * It produces a plain data structure (never HTML), which `MarkdownComponent` renders through
 * Angular templates. All text reaches the DOM as text nodes, and link targets are restricted to
 * http(s) URLs, so no unsanitised input is ever injected as markup.
 */

export type MdInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'em'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string };

export type MdBlock =
  | { type: 'heading'; level: 1 | 2 | 3; inlines: MdInline[] }
  | { type: 'paragraph'; inlines: MdInline[] }
  | { type: 'blockquote'; inlines: MdInline[] }
  | { type: 'ul'; items: MdInline[][] }
  | { type: 'ol'; start: number; items: MdInline[][] };

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/;

export function parseInline(value: string): MdInline[] {
  return value
    .split(INLINE_PATTERN)
    .filter(Boolean)
    .map((part): MdInline => {
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return { type: 'strong', text: part.slice(2, -2) };
      }
      if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
        return { type: 'em', text: part.slice(1, -1) };
      }
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
        return { type: 'code', text: part.slice(1, -1) };
      }
      const link = LINK_PATTERN.exec(part);
      if (link) return { type: 'link', text: link[1], href: link[2] };
      return { type: 'text', text: part };
    });
}

export function parseMarkdown(source: string | null | undefined): MdBlock[] {
  const lines = (source ?? '').replace(/\r/g, '').split('\n');
  const blocks: MdBlock[] = [];
  let bullets: MdInline[][] = [];
  let ordered: MdInline[][] = [];
  let orderedStart = 1;

  const flush = () => {
    if (bullets.length) blocks.push({ type: 'ul', items: bullets });
    if (ordered.length) blocks.push({ type: 'ol', start: orderedStart, items: ordered });
    bullets = [];
    ordered = [];
  };

  for (const line of lines) {
    const bullet = /^\s*[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      if (ordered.length) flush();
      bullets.push(parseInline(bullet[1]));
      continue;
    }
    const numbered = /^\s*(\d+)\.\s+(.+)$/.exec(line);
    if (numbered) {
      if (bullets.length) flush();
      // The first item's number is the list's start value (e.g. "3." continues a numbering).
      if (!ordered.length) orderedStart = Number.parseInt(numbered[1], 10);
      ordered.push(parseInline(numbered[2]));
      continue;
    }
    flush();
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, inlines: parseInline(line.slice(4)) });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, inlines: parseInline(line.slice(3)) });
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, inlines: parseInline(line.slice(2)) });
    } else if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', inlines: parseInline(line.slice(2)) });
    } else if (line.trim()) {
      blocks.push({ type: 'paragraph', inlines: parseInline(line) });
    }
  }
  flush();
  return blocks;
}
