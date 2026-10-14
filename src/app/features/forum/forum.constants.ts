import { ForumCategoryContent } from './forum.models';

/** Page copy for the canonical categories, keyed by slug. Ported from Next `forum-categories.ts`. */
export const FORUM_CATEGORY_CONTENT: readonly ForumCategoryContent[] = [
  {
    name: 'MoHUA',
    slug: 'mohua',
    description:
      'Official MoHUA guidance, policy clarifications, programme updates, and ministry-level discussions.',
    eyebrow: 'Ministry guidance',
    heading: 'MoHUA discussions',
    message:
      'Follow ministry guidance, raise policy questions, and discuss national urban-development programmes with MoHUA stakeholders.',
  },
  {
    name: 'State Specific',
    slug: 'state-specific',
    description: 'State-level implementation, finance, governance, and coordination discussions.',
    eyebrow: 'State coordination',
    heading: 'State-specific discussions',
    message:
      'Discuss state policies, implementation challenges, DMA coordination, and approaches that can support ULBs across the state.',
  },
  {
    name: 'ULB Queries',
    slug: 'ulb-queries',
    description:
      'Practical questions from ULBs about grants, compliance, reporting, and municipal finance.',
    eyebrow: 'ULB support',
    heading: 'ULB queries',
    message:
      'Ask practical questions about grant compliance, reporting, municipal finance, and day-to-day implementation at the ULB level.',
  },
];

export const FORUM_CATEGORY_SLUGS: string[] = FORUM_CATEGORY_CONTENT.map((c) => c.slug);

export function findCategoryContent(slug: string): ForumCategoryContent | undefined {
  return FORUM_CATEGORY_CONTENT.find((c) => c.slug === slug);
}

export const THREADS_PAGE_SIZE = 6;
/** Comments nest to three levels: depth 0, 1 and 2. */
export const MAX_COMMENT_DEPTH = 3;
