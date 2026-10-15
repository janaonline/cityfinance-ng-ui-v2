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
