import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ReturnClaimLetterDialogComponent,
  ReturnClaimLetterDialogData,
} from './return-claim-letter-dialog.component';

describe('ReturnClaimLetterDialogComponent', () => {
  let fixture: ComponentFixture<ReturnClaimLetterDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ReturnClaimLetterDialogComponent>>;

  const create = (data: ReturnClaimLetterDialogData): HTMLElement => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(ReturnClaimLetterDialogComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  const confirmButton = (host: HTMLElement) =>
    host.querySelector<HTMLButtonElement>('mat-dialog-actions .rcl-confirm') as HTMLButtonElement;

  const labels = (host: HTMLElement) =>
    Array.from(host.querySelectorAll('.rcl-option')).map((l) => l.textContent?.trim());

  const tick = (host: HTMLElement, label: string) => {
    const box = Array.from(host.querySelectorAll<HTMLLabelElement>('.rcl-option'))
      .find((l) => l.textContent?.trim() === label)
      ?.querySelector('input') as HTMLInputElement;
    box.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [ReturnClaimLetterDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'letter', returnedUlbCount: 0 } },
      ],
    }).compileComponents();
  });

  describe('one ULB', () => {
    it("offers the ULB's own forms and its rows in the three row forms, never the State-wide items", () => {
      const host = create({ mode: 'ulb', ulbName: 'Khowai', decision: null, exemptions: [] });

      expect(host.textContent).toContain('Return Khowai for correction?');
      expect(labels(host)).toEqual([
        'Audited Statements',
        'Provisional Statements',
        'PFMS Bank Account',
        'Service Level Benchmarks',
        'Detailed Utilisation Report',
        'Elected Bodies',
        'Devolution',
        'FC Unspent Disclosure',
      ]);
    });

    it('needs a form ticked, then closes with the forms split by kind and the trimmed remark', () => {
      const host = create({ mode: 'ulb', ulbName: 'Khowai', decision: null, exemptions: [] });
      expect(confirmButton(host).disabled).toBeTrue();

      tick(host, 'PFMS Bank Account');
      tick(host, 'Elected Bodies');
      fixture.componentInstance.remark.setValue('  Wrong IFSC  ');
      confirmButton(host).click();

      expect(dialogRef.close).toHaveBeenCalledWith({
        ulbFormIds: [33],
        rowFormIds: [23],
        rejectExemptionFormIds: [],
        remark: 'Wrong IFSC',
      });
    });

    it('opens prefilled with an earlier return of the same ULB', () => {
      const host = create({
        mode: 'ulb',
        ulbName: 'Khowai',
        decision: {
          status: 'RETURNED',
          ulbFormIds: [30],
          rowFormIds: [25],
          rejectExemptionFormIds: [],
          remark: 'Seal missing',
          decidedAt: '',
        },
        exemptions: [],
      });

      const checked = Array.from(host.querySelectorAll<HTMLLabelElement>('.rcl-option'))
        .filter((l) => (l.querySelector('input') as HTMLInputElement).checked)
        .map((l) => l.textContent?.trim());
      expect(checked).toEqual(['Audited Statements', 'FC Unspent Disclosure']);
      expect(fixture.componentInstance.remark.value).toBe('Seal missing');
    });
  });

  describe('one "Eligible via exemption" ULB', () => {
    const exemptions = [
      { formId: 23, exemptionId: 'e1', status: 5 },
      { formId: 30, exemptionId: 'e1', status: 7 },
    ];
    const option = (host: HTMLElement, label: string) =>
      Array.from(host.querySelectorAll<HTMLLabelElement>('.rcl-option')).find((l) => l.textContent?.includes(label));

    it('lists only its exemptions, with decided ones shown but not pickable', () => {
      const host = create({ mode: 'ulb', ulbName: 'Test TT', decision: null, exemptions });

      expect(labels(host)).toEqual([
        'Elected Bodies (exemption under review)',
        'Audited Statements (exemption approved)',
      ]);
      expect((option(host, 'Audited')?.querySelector('input') as HTMLInputElement).disabled).toBeTrue();
      expect(host.textContent).not.toContain('PFMS Bank Account');
    });

    it('needs a ticked exemption and a remark, then closes with the exemptions to reject', () => {
      const host = create({ mode: 'ulb', ulbName: 'Test TT', decision: null, exemptions });

      (option(host, 'Elected Bodies')?.querySelector('input') as HTMLInputElement).click();
      fixture.detectChanges();
      expect(confirmButton(host).disabled).toBeTrue();

      fixture.componentInstance.remark.setValue(' Election not held ');
      fixture.detectChanges();
      expect(confirmButton(host).disabled).toBeFalse();
      confirmButton(host).click();

      expect(dialogRef.close).toHaveBeenCalledWith({
        ulbFormIds: [],
        rowFormIds: [],
        rejectExemptionFormIds: [23],
        remark: 'Election not held',
      });
    });

    it('says there is nothing to reject when MoHUA decided every exemption', () => {
      const host = create({
        mode: 'ulb',
        ulbName: 'Test TT',
        decision: null,
        exemptions: [{ formId: 23, exemptionId: 'e1', status: 7 }],
      });

      expect(host.textContent).toContain('nothing to reject');
      expect(confirmButton(host).disabled).toBeTrue();
    });
  });

  describe('the whole letter', () => {
    it('offers only the State-wide items', () => {
      expect(labels(create({ mode: 'letter', returnedUlbCount: 0 }))).toEqual([
        'Claim Letter',
        'SFC Status',
        'Grant Transfer Certificate',
      ]);
    });

    it('needs a State item when no ULB is marked returned, and says what will happen', () => {
      const host = create({ mode: 'letter', returnedUlbCount: 0 });
      expect(confirmButton(host).disabled).toBeTrue();
      expect(host.querySelector('.rcl-outcome')).toBeNull();

      tick(host, 'SFC Status');

      expect(confirmButton(host).disabled).toBeFalse();
      const outcome = host.querySelector('.rcl-outcome')?.textContent ?? '';
      expect(outcome).toContain('SFC Status reopens for the State.');
      expect(outcome).toContain('The claim letter closes');
    });

    it('can return with only marked ULBs, and closes with the State items and remark; nothing on cancel', () => {
      const host = create({ mode: 'letter', returnedUlbCount: 2 });
      expect(confirmButton(host).disabled).toBeFalse();
      expect(host.querySelector('.rcl-outcome')?.textContent).toContain('2 ULB(s) marked returned reopen');

      tick(host, 'Grant Transfer Certificate');
      fixture.componentInstance.remark.setValue('Attach the order');
      confirmButton(host).click();

      expect(dialogRef.close).toHaveBeenCalledWith({ stateFormIds: [35], stateRemark: 'Attach the order' });

      (host.querySelector('mat-dialog-actions button') as HTMLButtonElement).click();
      expect(dialogRef.close).toHaveBeenCalledWith(undefined);
    });
  });
});
