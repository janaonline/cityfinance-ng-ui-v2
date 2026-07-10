import { ElectedBodyStatus, ReviewStatus, UlbSubmissionRow } from './ulb-submissions.models';

export const MOCK_STATE_NAME = 'Andhra Pradesh';
export const MOCK_GRANT_NAME = 'Basic Grants';

const ULB_NAME_POOL: readonly string[] = [
  'Adanki (TP)', 'Amadalavalasa', 'Amalapuram', 'Anantapur', 'Atmakur (N)', 'Chimakurthy (TP)', 'Chirala',
  'Gollaprolu', 'Hindupur', 'Ichapuram', 'Kakinada', 'Kandukur', 'Ponnuru', 'Puttaparthi', 'Puttur',
  'Rajahmundry', 'Vijayawada', 'Visakhapatnam', 'Guntur', 'Nellore', 'Kurnool', 'Kadapa', 'Tirupati',
  'Chittoor', 'Ongole', 'Machilipatnam', 'Eluru', 'Bhimavaram', 'Tadepalligudem', 'Narasaraopet', 'Tenali',
  'Proddatur', 'Adoni', 'Madanapalle', 'Dharmavaram', 'Gudivada', 'Srikakulam', 'Vizianagaram', 'Rajampet',
  'Nandyal', 'Markapur', 'Chilakaluripet', 'Bapatla', 'Repalle', 'Tanuku', 'Palakollu', 'Rajam',
  'Parvathipuram', 'Salur', 'Bobbili', 'Anakapalli', 'Yelamanchili', 'Narsipatnam', 'Palasa', 'Sompeta',
  'Naidupeta', 'Sullurpeta', 'Gudur', 'Kavali', 'Venkatagiri', 'Rapur', 'Yerraguntla', 'Jammalamadugu',
  'Pulivendla', 'Rayachoti', 'Punganur', 'Kuppam', 'Palamaner', 'Nagari', 'Srikalahasti',
];

// Weighted so the mix mirrors the "mostly approved, some pending, a few exempt/returned" pattern in the design.
const FORM_STATUS_CYCLE: readonly ReviewStatus[] = [
  'APPROVED', 'APPROVED', 'APPROVED', 'SUBMITTED', 'SUBMITTED', 'APPROVED', 'EXEMPT', 'SUBMITTED',
  'APPROVED', 'RETURNED', 'SUBMITTED', 'APPROVED', 'NOT_STARTED', 'IN_PROGRESS', 'APPROVED',
];
const FC_UNSPENT_CYCLE: readonly ReviewStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'NOT_STARTED', 'APPROVED', 'NOT_STARTED'];
const ELECTED_BODY_CYCLE: readonly ElectedBodyStatus[] = ['CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'CONSTITUTED', 'NOT_CONSTITUTED'];

function nameForIndex(index: number): string {
  const cycle = Math.floor(index / ULB_NAME_POOL.length);
  const base = ULB_NAME_POOL[index % ULB_NAME_POOL.length];
  const suffix = ['', ' (II)', ' (III)'][cycle] ?? ` (${cycle + 1})`;
  return `${base}${suffix}`;
}

function overallStatusForIndex(index: number, formStatus: ReviewStatus): { completed: number; total: number } {
  const total = 5;
  if (formStatus === 'APPROVED') return { completed: 2 + (index % (total - 1)), total };
  if (formStatus === 'EXEMPT') return { completed: (index % total) as number, total };
  return { completed: index % total, total };
}

export function buildMockUlbSubmissionRows(count = 123): UlbSubmissionRow[] {
  return Array.from({ length: count }, (_, index) => {
    const formStatus = FORM_STATUS_CYCLE[index % FORM_STATUS_CYCLE.length];
    const daysAgo = index % 30;
    const lastUpdatedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    return {
      ulbId: `mock-ulb-${index + 1}`,
      ulbCode: `AP-${(index + 1).toString().padStart(3, '0')}`,
      ulbName: nameForIndex(index),
      electedBodyStatus: ELECTED_BODY_CYCLE[index % ELECTED_BODY_CYCLE.length],
      fcUnspentStatus: FC_UNSPENT_CYCLE[index % FC_UNSPENT_CYCLE.length],
      formStatus,
      overallStatus: overallStatusForIndex(index, formStatus),
      lastUpdatedAt,
    };
  });
}
