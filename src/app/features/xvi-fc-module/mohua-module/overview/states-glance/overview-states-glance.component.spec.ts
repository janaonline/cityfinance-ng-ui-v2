import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { StateRow, StateStatus } from '../overview.models';
import { OverviewStatesGlanceComponent } from './overview-states-glance.component';

const row = (code: string, status: StateStatus, underReviewSince: string | null = null): StateRow => ({
  stateId: `id-${code}`,
  code,
  name: code,
  status,
  underReviewSince,
  allocation: 100,
  eligible: null,
  ulbsDone: null,
  ulbsTotal: 10,
  formsDone: 0,
  forms: [],
});

describe('OverviewStatesGlanceComponent default selection', () => {
  const setup = (rows: StateRow[]) => {
    TestBed.configureTestingModule({
      imports: [OverviewStatesGlanceComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    });
    const fixture = TestBed.createComponent(OverviewStatesGlanceComponent);
    fixture.componentRef.setInput('rows', rows);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('opens on the under-review state that got there first', () => {
    const component = setup([
      row('AA', 'notStarted'),
      row('KA', 'review', '2026-08-02T10:00:00.000Z'),
      row('MH', 'review', '2026-07-20T10:00:00.000Z'),
      row('TN', 'progress'),
    ]);

    expect(component.selected()?.code).toBe('MH');
  });

  it('puts an under-review state without a date after those that have one', () => {
    const component = setup([row('AP', 'review'), row('KA', 'review', '2026-08-02T10:00:00.000Z')]);

    expect(component.selected()?.code).toBe('KA');
  });

  it('falls back to an in-progress state when none is under review', () => {
    const component = setup([row('AA', 'notStarted'), row('GJ', 'progress'), row('UP', 'progress')]);

    expect(component.selected()?.code).toBe('GJ');
  });

  it('falls back to the first state when nothing is under review or in progress', () => {
    const component = setup([row('AA', 'notStarted'), row('BB', 'notStarted')]);

    expect(component.selected()?.code).toBe('AA');
  });

  it('keeps the state the user picked over the default', () => {
    const component = setup([row('AA', 'notStarted'), row('KA', 'review', '2026-08-02T10:00:00.000Z')]);

    component.select('AA');

    expect(component.selected()?.code).toBe('AA');
  });

  it('has nothing selected when there are no states', () => {
    expect(setup([]).selected()).toBeNull();
  });
});

describe('OverviewStatesGlanceComponent claim letter chips', () => {
  const letter = (status: number) => ({
    id: `l${status}`,
    number: `CF_KA_${status}`,
    batchNumber: 1,
    receivedOn: null,
    ulbCount: 1,
    amount: 1,
    status,
    statusLabel: '',
  });

  const setup = (claimLetters: ReturnType<typeof letter>[]) => {
    TestBed.configureTestingModule({
      imports: [OverviewStatesGlanceComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    });
    const fixture = TestBed.createComponent(OverviewStatesGlanceComponent);
    fixture.componentRef.setInput('rows', [row('KA', 'review')]);
    fixture.componentRef.setInput('claims', [
      {
        stateId: 'id-KA',
        name: 'KA',
        code: 'KA',
        firstClaimStatus: claimLetters.length ? 'RECEIVED' : 'PENDING',
        installmentAllocation: 100,
        amountClaimed: 10,
        ulbsIncluded: 1,
        claimLetterCount: claimLetters.length,
        latestClaimNumber: claimLetters.length || null,
        claimLetters,
      },
    ]);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('counts submitted, approved (5, 7), under review (15) and returned (16, 6), leaving out zero counts', () => {
    const component = setup([letter(15), letter(5), letter(7), letter(16)]);

    expect(component.claimChips(row('KA', 'review')).map((c) => c.label)).toEqual([
      '4 submitted',
      '2 approved',
      '1 under review',
      '1 returned',
    ]);
  });

  it('puts every count in the accessible name of the row link, since a narrow column clips chips from view', () => {
    const component = setup([letter(15), letter(16)]);

    const label = component.rowLabel(row('KA', 'review'));
    expect(label).toContain('View KA');
    expect(label).toContain('2 submitted, 1 under review, 1 returned');
  });

  it('shows no chips for a State without a letter (its cell falls back to the claim text)', () => {
    const component = setup([]);

    expect(component.claimChips(row('KA', 'review'))).toEqual([]);
  });
});
