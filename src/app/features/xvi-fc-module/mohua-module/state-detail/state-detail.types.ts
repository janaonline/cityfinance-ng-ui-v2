// Display types for the State detail summary cards. The data itself comes from the MoHUA state-detail API.
export type Tone = 'teal' | 'orange' | 'good' | 'bad' | 'grey';
export type IconMotion = 'grow' | 'pop' | 'bob' | 'flip' | 'back' | 'fly';

export interface StatItem {
  value: string;
  label: string;
  note: string;
  icon: string;
  tone: Tone;
  motion: IconMotion;
}
