import { BlogBlock, ClinicPost } from '../types';

/**
 * Converts a text/markdown body into structured blocks if blocks are missing.
 */
export function parseBodyToBlocks(bodyText: string): BlogBlock[] {
  if (!bodyText || !bodyText.trim()) {
    return [
      {
        id: `block_${Date.now()}_1`,
        type: 'paragraph',
        content: '',
      },
    ];
  }

  const chunks = bodyText.split(/\n\n+/).map((c) => c.trim()).filter(Boolean);
  const blocks: BlogBlock[] = [];

  chunks.forEach((chunk, index) => {
    const id = `block_${Date.now()}_${index}`;
    // Heading 2 or 3
    if (chunk.startsWith('### ')) {
      blocks.push({
        id,
        type: 'heading',
        level: 'h3',
        headingText: chunk.replace(/^###\s*/, ''),
      });
    } else if (chunk.startsWith('## ') || chunk.startsWith('# ')) {
      blocks.push({
        id,
        type: 'heading',
        level: 'h2',
        headingText: chunk.replace(/^#{1,2}\s*/, ''),
      });
    }
    // Numbered list
    else if (/^\d+\.\s/.test(chunk)) {
      const items = chunk.split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      blocks.push({
        id,
        type: 'list',
        listType: 'numbered',
        items: items.length ? items : [chunk],
      });
    }
    // Bullet list
    else if (chunk.startsWith('- ') || chunk.startsWith('• ') || chunk.startsWith('* ')) {
      const items = chunk.split('\n').map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      blocks.push({
        id,
        type: 'list',
        listType: 'bullet',
        items: items.length ? items : [chunk],
      });
    }
    // Quote
    else if (chunk.startsWith('> ')) {
      const quoteText = chunk.replace(/^>\s*/, '').trim();
      blocks.push({
        id,
        type: 'quote',
        quoteText,
        quoteAuthor: '',
      });
    }
    // Callout markdown hint
    else if (chunk.toLowerCase().includes('[key takeaway]') || chunk.toLowerCase().includes('[warning]')) {
      blocks.push({
        id,
        type: 'callout',
        calloutVariant: chunk.toLowerCase().includes('warning') ? 'warning' : 'takeaway',
        calloutTitle: chunk.toLowerCase().includes('warning') ? 'Clinical Warning' : 'Key Clinical Takeaway',
        calloutText: chunk.replace(/\[(key takeaway|warning)\]/gi, '').trim(),
      });
    }
    // Standard paragraph
    else {
      blocks.push({
        id,
        type: 'paragraph',
        content: chunk,
      });
    }
  });

  return blocks.length ? blocks : [{ id: `block_${Date.now()}_default`, type: 'paragraph', content: bodyText }];
}

/**
 * Serializes structured blocks into a standard markdown/text string for backwards compatibility and SEO.
 */
export function serializeBlocksToBody(blocks: BlogBlock[]): string {
  if (!blocks || !blocks.length) return '';

  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return block.level === 'h3' ? `### ${block.headingText}` : `## ${block.headingText}`;
        case 'paragraph':
          return block.content || '';
        case 'list':
          if (block.listType === 'numbered') {
            return (block.items || []).map((item, i) => `${i + 1}. ${item}`).join('\n');
          }
          return (block.items || []).map((item) => `- ${item}`).join('\n');
        case 'quote':
          return block.quoteAuthor ? `> "${block.quoteText}" — ${block.quoteAuthor}` : `> ${block.quoteText}`;
        case 'callout':
          return `[${block.calloutTitle || 'Note'}]\n${block.calloutText || ''}`;
        case 'cta':
          return `[CTA: ${block.ctaHeadline || 'Schedule Consultation'}] - ${block.ctaSubtitle || ''}`;
        case 'image':
          return block.caption ? `![${block.imageAlt || 'Image'}](${block.imageUrl})\n*${block.caption}*` : `![${block.imageAlt || 'Image'}](${block.imageUrl})`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Calculates total word count across blocks.
 */
export function calculateBlocksWordCount(blocks: BlogBlock[]): number {
  if (!blocks || !blocks.length) return 0;
  let words = 0;
  blocks.forEach((b) => {
    if (b.content) words += b.content.trim().split(/\s+/).filter(Boolean).length;
    if (b.headingText) words += b.headingText.trim().split(/\s+/).filter(Boolean).length;
    if (b.items) b.items.forEach((item) => { words += item.trim().split(/\s+/).filter(Boolean).length; });
    if (b.quoteText) words += b.quoteText.trim().split(/\s+/).filter(Boolean).length;
    if (b.calloutText) words += b.calloutText.trim().split(/\s+/).filter(Boolean).length;
    if (b.ctaHeadline) words += b.ctaHeadline.trim().split(/\s+/).filter(Boolean).length;
  });
  return words;
}
