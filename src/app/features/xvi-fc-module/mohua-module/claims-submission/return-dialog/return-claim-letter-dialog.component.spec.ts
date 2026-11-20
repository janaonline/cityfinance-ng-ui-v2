import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReturnClaimLetterDialogComponent, ReturnClaimLetterDialogData } from './return-claim-letter-dialog.component';

/** The letter-mode dialog data, with nothing locked and no other letter under review unless a test says so. */
function letterData(
  extra: Partial<Extract<ReturnClaimLetterDialogData, { mode: 'letter' }>> = {},
): ReturnClaimLetterDialogData {
  return { mode: 'letter', returnedUlbCount: 0, returnedRowUlbCount: 0, stateForms: [], otherLetters: [], ...extra };
}

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
        { provide: MAT_DIALOG_DATA, useValue: letterData() },
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
      // The remark is required (10+ characters), so Confirm only enables once the page re-renders.
      fixture.detectChanges();
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

  describe('remarks', () => {
    it('keep Confirm disabled until they are at least 10 characters once trimmed, in every mode', () => {
      const host = create(letterData({ returnedUlbCount: 1 }));
      const set = (value: string) => {
        fixture.componentInstance.remark.setValue(value);
        fixture.detectChanges();
      };

      set('Too short');
      expect(confirmButton(host).disabled).toBeTrue();
      set('   Too short      ');
      expect(confirmButton(host).disabled).toBeTrue();
      set('Long enough now');
      expect(confirmButton(host).disabled).toBeFalse();
    });

    it('also apply to marking one ULB', () => {
      const host = create({ mode: 'ulb', ulbName: 'Khowai', decision: null, exemptions: [] });
      tick(host, 'PFMS Bank Account');
      fixture.componentInstance.remark.setValue('IFSC');
      fixture.detectChanges();
      expect(confirmButton(host).disabled).toBeTrue();
    });
  });

  describe('the whole letter', () => {
    it('offers only the State-wide items', () => {
      expect(labels(create(letterData({ returnedUlbCount: 0 })))).toEqual([
        'Claim Letter',
        'SFC Status',
        'Grant Transfer Certificate',
      ]);
    });

    it('needs a State item when no ULB is marked returned, and says what will happen', () => {
      const host = create(letterData({ returnedUlbCount: 0 }));
      expect(confirmButton(host).disabled).toBeTrue();
      expect(host.querySelector('.rcl-outcome')).toBeNull();

      tick(host, 'SFC Status');
      fixture.componentInstance.remark.setValue('Fix the SFC status');
      fixture.detectChanges();

      expect(confirmButton(host).disabled).toBeFalse();
      const outcome = host.querySelector('.rcl-outcome')?.textContent ?? '';
      expect(outcome).toContain('SFC Status reopens for the State.');
      expect(outcome).toContain('The claim letter closes');
    });

    it('can return with only marked ULBs, and closes with the State items and remark; nothing on cancel', () => {
      const host = create(letterData({ returnedUlbCount: 2 }));
      // Marked ULBs are enough to return, but not without a remark.
      expect(confirmButton(host).disabled).toBeTrue();
      expect(host.querySelector('.rcl-hint')?.textContent).toContain('at least 10 characters');

      fixture.componentInstance.remark.setValue('Attach the order');
      fixture.detectChanges();
      expect(confirmButton(host).disabled).toBeFalse();
      expect(host.querySelector('.rcl-outcome')?.textContent).toContain('2 ULB(s) marked returned reopen');

      tick(host, 'Grant Transfer Certificate');
      confirmButton(host).click();

      expect(dialogRef.close).toHaveBeenCalledWith({
        stateFormIds: [35],
        stateRemark: 'Attach the order',
        affectedLetterIds: [],
      });

      (host.querySelector('mat-dialog-actions button') as HTMLButtonElement).click();
      expect(dialogRef.close).toHaveBeenCalledWith(undefined);
    });
  });

  describe("the State's other letters (parallel claims)", () => {
    const others = [
      { id: 'c2', number: 'CF_TR_2026-27_1-2' },
      { id: 'c3', number: 'CF_TR_2026-27_1-3' },
    ];

    const option = (host: HTMLElement, label: string) =>
      Array.from(host.querySelectorAll<HTMLLabelElement>('.rcl-option')).find((l) => l.textContent?.includes(label))!;

    it('shows SFC accepted with an earlier letter as a tag, says why on its (i), and does not let it be ticked', () => {
      const host = create(
        letterData({
          stateForms: [
            {
              formId: 22,
              name: 'SFC Status',
              returnable: false,
              lockReason: 'ACCEPTED',
              acceptedWithLetter: 'Claim Letter 1',
            },
            {
              formId: 35,
              name: 'Grant Transfer Certificate',
              returnable: true,
              lockReason: null,
              acceptedWithLetter: null,
            },
          ],
        }),
      );
      const sfc = option(host, 'SFC Status');
      const gtc = option(host, 'Grant Transfer Certificate');

      expect(sfc.querySelector('.rcl-tag')?.textContent?.trim()).toBe('Accepted');
      expect(sfc.querySelector('[data-cy="return-state-form-why"]')?.getAttribute('aria-label')).toBe(
        'Accepted when Claim Letter 1 was approved. It is settled for this installment and can no longer be returned.',
      );
      expect(sfc.classList).toContain('rcl-option--disabled');
      expect(sfc.querySelector('input')!.disabled).toBeTrue();
      expect(gtc.querySelector('.rcl-tag')).toBeNull();
      expect(gtc.querySelector('[data-cy="return-state-form-why"]')).toBeNull();
      fixture.componentInstance.toggle(22);
      expect(fixture.componentInstance.isSelected(22)).toBeFalse();
    });

    it('tells an exempted form from one not in this review', () => {
      const host = create(
        letterData({
          stateForms: [
            { formId: 22, name: 'SFC Status', returnable: false, lockReason: 'EXEMPTED', acceptedWithLetter: null },
            {
              formId: 35,
              name: 'Grant Transfer Certificate',
              returnable: false,
              lockReason: 'NOT_IN_REVIEW',
              acceptedWithLetter: null,
            },
          ],
        }),
      );
      const why = (label: string) =>
        option(host, label).querySelector('[data-cy="return-state-form-why"]')?.getAttribute('aria-label');

      expect(option(host, 'SFC Status').querySelector('.rcl-tag')?.textContent?.trim()).toBe('Exempted');
      expect(why('SFC Status')).toBe(
        "This letter relies on the State's exemption for this form, so there is no form to return.",
      );
      expect(option(host, 'Grant Transfer Certificate').querySelector('.rcl-tag')?.textContent?.trim()).toBe(
        'Not in review',
      );
      expect(why('Grant Transfer Certificate')).toBe(
        "This form is not under review with this letter, so it can't be returned here.",
      );
    });

    it("lets the SO tick a form the State's own pending exemption covers, which rejects that exemption", () => {
      const host = create(
        letterData({
          stateForms: [
            {
              formId: 22,
              name: 'SFC Status',
              returnable: true,
              lockReason: null,
              acceptedWithLetter: null,
              rejectsExemption: true,
              exemptionStatus: 5,
            },
          ],
        }),
      );
      const sfc = option(host, 'SFC Status');

      expect(sfc.querySelector('.rcl-tag')?.textContent?.trim()).toBe('Reject exemption');
      expect(sfc.querySelector('input')!.disabled).toBeFalse();

      fixture.componentInstance.toggle(22);
      fixture.componentInstance.remark.setValue('SFC was never constituted');
      fixture.detectChanges();

      const outcome = host.querySelector('.rcl-outcome')?.textContent ?? '';
      expect(outcome).toContain("The State's exemption for SFC Status is rejected; the State must file it.");
      expect(outcome).not.toContain('SFC Status reopens');
    });

    it('says how the State exemption was decided once the SO can no longer act on it', () => {
      const host = create(
        letterData({
          stateForms: [
            {
              formId: 22,
              name: 'SFC Status',
              returnable: false,
              lockReason: 'EXEMPTED',
              acceptedWithLetter: null,
              exemptionStatus: 7,
            },
          ],
        }),
      );

      expect(option(host, 'SFC Status').querySelector('.rcl-tag')?.textContent?.trim()).toBe('Exemption approved');
      expect(option(host, 'SFC Status').querySelector('input')!.disabled).toBeTrue();
    });

    it('still explains an accepted form when the accepting letter is unknown', () => {
      const host = create(
        letterData({
          stateForms: [
            { formId: 22, name: 'SFC Status', returnable: false, lockReason: 'ACCEPTED', acceptedWithLetter: null },
          ],
        }),
      );

      expect(
        option(host, 'SFC Status').querySelector('[data-cy="return-state-form-why"]')?.getAttribute('aria-label'),
      ).toBe('Already accepted by MoHUA for this installment, so it can no longer be returned.');
    });

    it('warns which letters a State form return also returns, and sends their ids', () => {
      const host = create(letterData({ otherLetters: others }));
      expect(host.querySelector('[data-cy="return-cascade-warning"]')).toBeNull();

      tick(host, 'SFC Status');
      fixture.componentInstance.remark.setValue('Fix the SFC status');
      fixture.detectChanges();

      expect(host.querySelector('[data-cy="return-cascade-warning"]')?.textContent).toContain(
        'Claim letters CF_TR_2026-27_1-2 and CF_TR_2026-27_1-3 of this State are also under review',
      );
      confirmButton(host).click();
      expect(dialogRef.close).toHaveBeenCalledWith({
        stateFormIds: [22],
        stateRemark: 'Fix the SFC status',
        affectedLetterIds: ['c2', 'c3'],
      });
    });

    it('warns for ULB rows marked for return too, since a row reopens its whole State form', () => {
      const host = create(letterData({ returnedUlbCount: 1, returnedRowUlbCount: 1, otherLetters: [others[0]] }));

      expect(host.querySelector('[data-cy="return-cascade-warning"]')?.textContent).toContain(
        'Returning the State forms of the ULB rows marked for return reopens them for the State. Claim letter ' +
          'CF_TR_2026-27_1-2 of this State is also under review and relies on them, so it will be returned too. The ' +
          'State must correct them and submit again.',
      );
    });

    it('gives no warning when only the claim letter is returned', () => {
      const host = create(letterData({ otherLetters: others }));
      tick(host, 'Claim Letter');
      expect(host.querySelector('[data-cy="return-cascade-warning"]')).toBeNull();
    });

    it('sends no other letter when it gave no warning, so an unannounced return is refused, not done', () => {
      // A ULB marked with its own forms only: the State's other letters are not touched.
      const host = create(letterData({ returnedUlbCount: 1, returnedRowUlbCount: 0, otherLetters: others }));
      fixture.componentInstance.remark.setValue('Fix the bank account');
      fixture.detectChanges();
      expect(host.querySelector('[data-cy="return-cascade-warning"]')).toBeNull();

      confirmButton(host).click();

      expect(dialogRef.close).toHaveBeenCalledWith({
        stateFormIds: [],
        stateRemark: 'Fix the bank account',
        affectedLetterIds: [],
      });
    });
  });
});
