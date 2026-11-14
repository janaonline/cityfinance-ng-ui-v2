import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClaimsSubmissionComponent } from './claims-submission.component';
import { ClaimLettersStates } from './claims-submission.models';
import { ClaimsSubmissionService } from './claims-submission.service';

const states: ClaimLettersStates = {
  year: { id: 'y1', label: '2026-27' },
  installment: 1,
  states: [
    {
      stateId: 's1',
      name: 'Andhra Pradesh',
      code: 'AP',
      firstClaimStatus: 'RECEIVED',
      installmentAllocation: 7_810_000_000,
      amountClaimed: 4_320_000_000,
      ulbsIncluded: 72,
      claimLetterCount: 3,
      latestClaimNumber: 3,
    },
    {
      stateId: 's2',
      name: 'Assam',
      code: 'AS',
      firstClaimStatus: 'PENDING',
      installmentAllocation: 2_090_000_000,
      amountClaimed: null,
      ulbsIncluded: null,
      claimLetterCount: 0,
      latestClaimNumber: null,
    },
  ],
};

describe('ClaimsSubmissionComponent', () => {
  let fixture: ComponentFixture<ClaimsSubmissionComponent>;
  let service: jasmine.SpyObj<ClaimsSubmissionService>;

  const create = (): HTMLElement => {
    fixture = TestBed.createComponent(ClaimsSubmissionComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj<ClaimsSubmissionService>('ClaimsSubmissionService', ['getStates']);
    service.getStates.and.returnValue(of(states));
    await TestBed.configureTestingModule({
      imports: [ClaimsSubmissionComponent],
      providers: [provideRouter([]), { provide: ClaimsSubmissionService, useValue: service }],
    }).compileComponents();
  });

  it('lists every state, with figures in crore and a dash where a state has nothing claimed', () => {
    const rows = Array.from(create().querySelectorAll('tbody tr'));

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Andhra Pradesh');
    expect(rows[0].textContent).toContain('Received');
    expect(rows[0].textContent).toContain('3rd');
    expect(rows[0].textContent).toContain('₹781 cr');
    expect(rows[0].textContent).toContain('₹432 cr');
    expect(rows[0].textContent).toContain('72');
    expect(rows[1].textContent).toContain('Pending');
    expect(rows[1].textContent).toContain('—');
  });

  it('offers View claims only for a state whose claim letter has arrived; Pending states get a disabled Track', () => {
    const rows = Array.from(create().querySelectorAll('tbody tr'));

    expect(rows[0].querySelector('a')?.textContent).toContain('View claims');
    expect(rows[0].querySelector('button')).toBeNull();
    const track = rows[1].querySelector('button') as HTMLButtonElement;
    expect(track.textContent).toContain('Track');
    expect(track.disabled).toBeTrue();
    expect(rows[1].querySelector('a')).toBeNull();
  });

  it('shows an error with a retry when the load fails', () => {
    service.getStates.and.returnValue(throwError(() => new Error('boom')));

    const host = create();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Could not load the claim letters');
    service.getStates.and.returnValue(of(states));
    (host.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.querySelectorAll('tbody tr').length).toBe(2);
  });
});
