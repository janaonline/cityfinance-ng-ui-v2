export type StateStatus = 'review' | 'progress' | 'notStarted' | 'ineligible';

export type ClaimLetterStatus = 'review' | 'returned' | 'approved';

export interface StateRow {
  id: string;
  /** Two-letter code shown on the state's bubble. */
  code: string;
  name: string;
  status: StateStatus;
  /** Amounts in crore; null when not applicable yet. */
  allocation: number;
  eligible: number | null;
  recommended: number | null;
  released: number | null;
  ulbsDone: number;
  ulbsTotal: number;
  /** Status of each claim letter the state has submitted; a state can have several. */
  claimLetters: ClaimLetterStatus[];
  /** How many of the five state forms (STATE_FORMS) the state has completed. */
  formsDone: number;
}

export const STATE_FORMS = [
  'SFC Status',
  'Elected Bodies',
  'Devolution',
  'FC Unspent Disclosure',
  'Grant Transfer Certificate',
] as const;

// Placeholder: forms completed per stage, until the MoHUA state-forms API exists.
const FORMS_DONE_BY_STATUS: Record<StateStatus, number> = { review: 5, progress: 3, notStarted: 1, ineligible: 0 };

// Placeholder rows until the MoHUA state-submissions API exists — replace with the real response.
const row = (
  name: string,
  code: string,
  status: StateStatus,
  allocation: number,
  eligible: number | null,
  ulbsDone: number,
  ulbsTotal: number,
  extra: Partial<Pick<StateRow, 'recommended' | 'released' | 'claimLetters'>> = {},
): StateRow => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  code,
  name,
  status,
  allocation,
  eligible,
  recommended: extra.recommended ?? null,
  released: extra.released ?? null,
  ulbsDone,
  ulbsTotal,
  claimLetters: extra.claimLetters ?? [],
  formsDone: FORMS_DONE_BY_STATUS[status],
});

export const STATE_ROWS: StateRow[] = [
  row('Andhra Pradesh', 'AP', 'review', 1562, 933, 63, 103, { recommended: 196, released: 196, claimLetters: ['approved', 'review'] }),
  row('Assam', 'AS', 'review', 417, 13, 8, 126, { claimLetters: ['review'] }),

  row('Chhattisgarh', 'CG', 'progress', 641, 131, 16, 44),
  row('Gujarat', 'GJ', 'progress', 3013, 92, 12, 166, { claimLetters: ['returned'] }),
  row('Haryana', 'HR', 'progress', 1026, 42, 8, 93),
  row('Jharkhand', 'JH', 'progress', 783, 10, 2, 43),
  row('Kerala', 'KL', 'progress', 2143, 138, 12, 93, { claimLetters: ['approved'] }),
  row('Odisha', 'OD', 'progress', 612, 23, 6, 114),
  row('Tamil Nadu', 'TN', 'progress', 3226, 931, 76, 121),

  row('Arunachal Pradesh', 'AR', 'notStarted', 30, null, 0, 26),
  row('Himachal Pradesh', 'HP', 'notStarted', 56, null, 0, 61),
  row('Karnataka', 'KA', 'notStarted', 2374, 76, 20, 315),
  row('Madhya Pradesh', 'MP', 'notStarted', 2017, null, 0, 412),
  row('Maharashtra', 'MH', 'notStarted', 6017, null, 0, 400),
  row('Manipur', 'MN', 'notStarted', 78, null, 0, 28),
  row('Meghalaya', 'ML', 'notStarted', 49, null, 0, 10),
  row('Mizoram', 'MZ', 'notStarted', 49, null, 0, 23),
  row('Nagaland', 'NL', 'notStarted', 86, null, 0, 19),
  row('Rajasthan', 'RJ', 'notStarted', 1639, null, 0, 213),
  row('Sikkim', 'SK', 'notStarted', 26, null, 0, 8),
  row('Telangana', 'TG', 'notStarted', 1483, null, 0, 142),
  row('Tripura', 'TR', 'notStarted', 130, null, 0, 20),
  row('Uttar Pradesh', 'UP', 'notStarted', 4305, null, 0, 762),
  row('Uttarakhand', 'UK', 'notStarted', 323, null, 0, 41),
  row('West Bengal', 'WB', 'notStarted', 2624, null, 0, 126),

  row('Bihar', 'BR', 'ineligible', 1370, null, 5, 142),
  row('Goa', 'GA', 'ineligible', 93, null, 1, 14),
  row('Punjab', 'PB', 'ineligible', 1008, null, 20, 167),
];
