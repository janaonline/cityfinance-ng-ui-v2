import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../../../../environments/environment';
import { UlbContacts } from '../../shared/profile-verification/profile-verification.models';
import { ProfileVerificationService } from '../../shared/profile-verification/profile-verification.service';
import { PageErrorStateComponent } from '../../shared/page-error-state/page-error-state.component';
import {
  IDENTIFIER_SECURITY_VALIDATORS,
  noHtmlOrScript,
  noMongoOperators,
} from '../../../../auth/validators/auth-security.validators';

type ContactType = 'commissioner' | 'accountant';

interface UlbBandInfo {
  name: string;
  code: string;
  stateName: string;
  initials: string;
}

interface RegisteredMunicipalInfo {
  stateName: string;
  ulbType: string;
  censusCode: string;
  ulbCode: string;
  area: number | null;
  population: number | null;
  wards: number | null;
}

interface ProfileContactsApiResponse extends UlbContacts {
  ulbDetails?: { name: string; code: string; stateName: string } | null;
  registeredMunicipalInfo?: RegisteredMunicipalInfo | null;
}

@Component({
  selector: 'app-ulb-roles-teams-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    PageErrorStateComponent,
  ],
  templateUrl: './roles-teams-overview.component.html',
  styleUrl: './roles-teams-overview.component.scss',
  animations: [
    trigger('detailExpand', [
      // maxHeight keeps height:auto on the wrapper so errors appearing after
      // expansion are not clipped by a frozen pixel height.
      state('collapsed', style({ maxHeight: '0px', opacity: 0 })),
      state('expanded', style({ maxHeight: '600px', opacity: 1 })),
      transition('collapsed => expanded', animate('240ms 40ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition('expanded => collapsed', animate('180ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class UlbRolesTeamsOverviewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileService = inject(ProfileVerificationService);
  private readonly baseUrl = environment.api.url2;

  // Literal space (not \s) intentionally excludes \t, \n, \r from valid name characters.
  private static readonly NAME_PATTERN = /^[a-zA-Z .\-']+$/;

  private userId = '';
  private ulbCode = '';
  private localStateName = '';

  readonly displayedColumns = ['name', 'designation', 'email', 'contact'];

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly ulbInfo = signal<UlbBandInfo | null>(null);
  readonly contacts = signal<UlbContacts | null>(null);
  readonly municipalInfo = signal<RegisteredMunicipalInfo | null>(null);
  readonly editingContact = signal<ContactType | null>(null);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  // ── Email-change OTP step (mirrors profile-verification.component.ts's own OTP flow) ──────────
  readonly otpStep = signal(false);
  readonly otpValue = signal('');
  readonly pendingEmail = signal('');
  readonly sendingOtp = signal(false);
  readonly resendCooldown = signal(0);
  private resendTimer?: ReturnType<typeof setInterval>;

  readonly canConfirmOtp = computed(() => /^\d{4}$/.test(this.otpValue()) && !this.isSaving());
  readonly canResend = computed(() => this.resendCooldown() === 0 && !this.sendingOtp());

  readonly contactRows = computed(() => {
    const c = this.contacts();
    if (!c) return [];
    // 'Conatact' typo in field names is from the API contract — do not rename here.
    return [
      this.mkRow('commissioner', 'Municipal Commissioner / Executive Officer',
        c.commissionerName ?? '', c.commissionerEmail ?? '', c.commissionerConatactNumber ?? ''),
      this.mkRow('accountant', 'ULB Nodal Officer',
        c.accountantName ?? '', c.accountantEmail ?? '', c.accountantConatactNumber ?? ''),
    ];
  });

  readonly municipalFields = computed(() => {
    const m = this.municipalInfo();
    if (!m) return [];
    return [
      { label: 'STATE', value: m.stateName, icon: 'map' },
      { label: 'ULB TYPE', value: m.ulbType, icon: 'account_balance' },
      { label: 'CENSUS CODE', value: m.censusCode, icon: 'fingerprint' },
      { label: 'ULB CODE', value: m.ulbCode, icon: 'badge' },
      { label: 'AREA', value: this.formatArea(m.area), icon: 'straighten' },
      { label: 'POPULATION (CENSUS 2011)', value: this.formatPopulation(m.population), icon: 'people' },
      { label: 'NO. OF WARDS', value: m.wards != null ? String(m.wards) : '', icon: 'grid_view' },
    ];
  });

  readonly editForm = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(UlbRolesTeamsOverviewComponent.NAME_PATTERN),
        noHtmlOrScript,
        noMongoOperators,
      ],
    ],
    mobile: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/),
        noHtmlOrScript,
        noMongoOperators,
      ],
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(254),
        ...IDENTIFIER_SECURITY_VALIDATORS,
      ],
    ],
  });

  ngOnInit(): void {
    this.resolveFromStorage();
    this.loadData();
    this.destroyRef.onDestroy(() => clearInterval(this.resendTimer));
  }

  private resolveFromStorage(): void {
    const u = this.profileService.readStoredUser();
    this.userId = u._id ?? u.id ?? '';
    this.ulbCode = u.ulbCode ?? '';
    this.localStateName = u.stateName ?? '';
  }

  loadData(): void {
    if (!this.userId) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.http
      .get<{ success: boolean; data: ProfileContactsApiResponse } | ProfileContactsApiResponse>(
        `${this.baseUrl}users/${this.userId}/profile-contacts`,
      )
      .pipe(
        map((r) => ('success' in r ? r.data : r) as ProfileContactsApiResponse),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          if (!res) {
            this.hasError.set(true);
            this.isLoading.set(false);
            return;
          }

          this.contacts.set({
            commissionerName: res.commissionerName,
            commissionerEmail: res.commissionerEmail,
            commissionerConatactNumber: res.commissionerConatactNumber,
            accountantName: res.accountantName,
            accountantEmail: res.accountantEmail,
            accountantConatactNumber: res.accountantConatactNumber,
          });

          const d = res.ulbDetails;
          const entityName = d?.name ?? '';
          this.ulbInfo.set({
            name: entityName,
            code: d?.code ?? this.ulbCode,
            stateName: d?.stateName ?? this.localStateName,
            initials: this.getInitials(entityName || this.ulbCode),
          });

          this.municipalInfo.set(res.registeredMunicipalInfo ?? null);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  rowHasWarning(_index: number, row: { nameInvalid: boolean; emailInvalid: boolean; mobileInvalid: boolean }): boolean {
    return row.nameInvalid || row.emailInvalid || row.mobileInvalid;
  }

  toggleEdit(type: ContactType): void {
    if (this.editingContact() === type) {
      this.cancelEdit();
    } else {
      this.startEdit(type);
    }
  }

  startEdit(type: ContactType): void {
    const c = this.contacts();
    if (!c) return;

    const isComm = type === 'commissioner';
    this.editForm.reset({
      name:   isComm ? (c.commissionerName ?? '')          : (c.accountantName ?? ''),
      mobile: isComm ? (c.commissionerConatactNumber ?? '') : (c.accountantConatactNumber ?? ''),
      email:  isComm ? (c.commissionerEmail ?? '')          : (c.accountantEmail ?? ''),
    });
    this.saveError.set(null);
    this.editingContact.set(type);
    this.editForm.markAllAsTouched();
  }

  cancelEdit(): void {
    this.editingContact.set(null);
    this.saveError.set(null);
    this.otpStep.set(false);
    clearInterval(this.resendTimer);
  }

  /** Original (stored) email for the contact currently being edited — used to tell whether the
   *  form's email value is actually a change, or just the same address being resent. */
  private originalEmailFor(type: ContactType): string {
    const c = this.contacts();
    if (!c) return '';
    return (type === 'commissioner' ? c.commissionerEmail : c.accountantEmail) ?? '';
  }

  saveEdit(): void {
    // Guard must be first — prevents a second call racing through before isSaving signal updates the DOM.
    if (this.isSaving()) return;
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const type = this.editingContact();
    if (!type || !this.userId) return;

    const { email } = this.editForm.getRawValue();
    const emailChanged = email.trim() !== this.originalEmailFor(type).trim();

    if (emailChanged) {
      this.checkDomainThenSendOtp(email.trim());
      return;
    }

    this.performSave(type);
  }

  /** Catches a typo'd/made-up domain up front, before spending an OTP send on it — the same
   *  check the backend would otherwise only run at final save time. */
  private checkDomainThenSendOtp(email: string): void {
    this.sendingOtp.set(true);
    this.saveError.set(null);

    this.profileService
      .checkEmailDomain(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ deliverable }) => {
        if (!deliverable) {
          this.sendingOtp.set(false);
          this.saveError.set(
            "This email domain doesn't appear to accept mail. Check for a typo in the email address.",
          );
          return;
        }
        this.sendOtpForEmailChange(email);
      });
  }

  /** Sends (or resends) an OTP to the new email address and, on success, switches this row into
   *  the OTP-entry step — mirrors profile-verification.component.ts's sendOtpAndShowStep(). */
  private sendOtpForEmailChange(email: string): void {
    this.sendingOtp.set(true);
    this.saveError.set(null);

    this.profileService
      .sendProfileOtp(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ sent }) => {
        this.sendingOtp.set(false);
        if (!sent) {
          this.saveError.set('Failed to send OTP. Please try again.');
          return;
        }
        this.pendingEmail.set(email);
        this.otpValue.set('');
        this.otpStep.set(true);
        this.saveError.set(null);
        this.startResendCooldown();
      });
  }

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = cleaned;
    this.otpValue.set(cleaned);
  }

  onConfirmOtp(): void {
    if (!this.canConfirmOtp()) return;
    const type = this.editingContact();
    if (!type) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    this.profileService
      .verifyProfileOtp(this.pendingEmail(), this.otpValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ verified }) => {
        if (!verified) {
          this.isSaving.set(false);
          this.saveError.set('Invalid or expired OTP. Please try again.');
          return;
        }

        this.profileService
          .issueProfileSaveToken(this.userId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(({ token }) => {
            if (!token) {
              this.isSaving.set(false);
              this.saveError.set('Could not verify. Please try again.');
              return;
            }
            this.performSave(type, token);
          });
      });
  }

  resendOtp(): void {
    if (!this.canResend()) return;
    this.sendOtpForEmailChange(this.pendingEmail());
  }

  private startResendCooldown(): void {
    clearInterval(this.resendTimer);
    this.resendCooldown.set(60);
    this.resendTimer = setInterval(() => {
      const next = this.resendCooldown() - 1;
      this.resendCooldown.set(next);
      if (next <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }

  /** Actual PATCH to profile-contacts. `saveToken` is only present once the new email has been
   *  OTP-verified for this session — an unchanged email never needs one. */
  private performSave(type: ContactType, saveToken?: string): void {
    this.isSaving.set(true);
    this.saveError.set(null);

    const { name, mobile, email } = this.editForm.getRawValue();
    const isComm = type === 'commissioner';

    const payload: Record<string, unknown> = isComm
      ? { commissionerName: name, commissionerEmail: email, commissionerConatactNumber: mobile }
      : { accountantName: name, accountantEmail: email, accountantConatactNumber: mobile };

    if (saveToken) {
      payload['saveToken'] = saveToken;
      // Proves (server-side, via the token) that the new email above was just OTP-verified.
      payload['isXviFcEmailVerified'] = true;
    }

    this.http
      .patch(`${this.baseUrl}users/${this.userId}/profile-contacts`, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const cur = this.contacts()!;
          this.contacts.set(
            isComm
              ? { ...cur, commissionerName: name, commissionerEmail: email, commissionerConatactNumber: mobile }
              : { ...cur, accountantName: name, accountantEmail: email, accountantConatactNumber: mobile },
          );
          this.editingContact.set(null);
          this.otpStep.set(false);
          this.isSaving.set(false);
          clearInterval(this.resendTimer);
          this.snackBar.open(
            `${isComm ? 'Commissioner' : 'Nodal Officer'} details updated.`,
            'Dismiss',
            { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
          );
        },
        error: (err: HttpErrorResponse) => {
          this.isSaving.set(false);
          const errors = err.error?.errors as Record<string, { message: string }[]> | undefined;
          const fieldMessage = errors && Object.values(errors)[0]?.[0]?.message;
          this.saveError.set(fieldMessage ?? err.error?.message ?? 'Failed to save. Please try again.');
          // A save-token rejection (expired/invalid) can't be retried by re-submitting the same
          // form — back out to a plain edit so the user restarts the email-change/OTP flow.
          if (saveToken) this.otpStep.set(false);
        },
      });
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = cleaned;
    this.editForm.get('mobile')?.setValue(cleaned, { emitEvent: true });
  }

  formatArea(area: number | null): string {
    return area != null ? `${area.toLocaleString('en-IN')} Sq kms` : '—';
  }

  formatPopulation(pop: number | null): string {
    return pop != null ? pop.toLocaleString('en-IN') : '—';
  }

  getInitials(name: string): string {
    return name
      .trim()
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  private mkRow(type: ContactType, label: string, name: string, email: string, mobile: string) {
    const emailTrimmed = email.trim();
    return {
      type,
      label,
      name,
      email,
      mobile,
      nameInvalid: !name.trim() || !UlbRolesTeamsOverviewComponent.NAME_PATTERN.test(name),
      emailInvalid: !emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed),
      mobileInvalid: !mobile.trim() || !/^[6-9]\d{9}$/.test(mobile),
    };
  }
}
