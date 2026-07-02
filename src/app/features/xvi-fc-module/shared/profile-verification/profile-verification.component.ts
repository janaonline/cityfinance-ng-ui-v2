import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subscription, filter, fromEvent, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControlStatus, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileVerificationService } from './profile-verification.service';
import { StateProfile, UlbEntityInfo } from './profile-verification.models';
import {
  IDENTIFIER_SECURITY_VALIDATORS,
  noHtmlOrScript,
  noMongoOperators,
} from '../../../../auth/validators/auth-security.validators';
import { buildXvifcFeatureLink, Roles } from '../../xvi-fc-side-menu.config';
import { PageErrorStateComponent } from '../page-error-state/page-error-state.component';

type ProfileRole = 'state' | 'ulb' | 'mohua';

const ROLE_MAP: Record<string, ProfileRole> = {
  STATE: 'state',
  XVIFC_STATE: 'state',
  ULB: 'ulb',
  XVIFC: 'ulb',
  MoHUA: 'mohua',
};

const ROUTE_ROLE_MAP: Record<string, Roles> = {
  STATE: 'STATE',
  XVIFC_STATE: 'STATE',
  ULB: 'ULB',
  XVIFC: 'ULB',
  MoHUA: 'MOHUA',
};

@Component({
  selector: 'app-profile-verification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    PageErrorStateComponent,
  ],
  templateUrl: './profile-verification.component.html',
  styleUrl: './profile-verification.component.scss',
})
export class ProfileVerificationComponent implements OnInit, OnDestroy {
  private popstateSub?: Subscription;
  private resendTimer?: number;
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileVerificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  role: ProfileRole = 'state';
  private year = '';
  private entityId = '';
  // M3 — cached from single localStorage parse in ngOnInit
  private userId = '';
  private routeRole: Roles = 'STATE';

  // ── Shared ───────────────────────────────────────────────────
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly errorMsg = signal('');
  readonly isSaving = signal(false);

  // ── ULB flow ─────────────────────────────────────────────────
  readonly entityDetails = signal<UlbEntityInfo | null>(null);
  readonly editingCommissioner = signal(false);
  readonly editingAccountant = signal(false);

  private static readonly NAME_PATTERN = /^[a-zA-Z\s.\-']+$/;
  private static readonly PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])/;

  readonly commissionerForm = this.fb.nonNullable.group({
    commissionerName: ['', [
      Validators.maxLength(100),
      Validators.pattern(ProfileVerificationComponent.NAME_PATTERN),
      noHtmlOrScript,
      noMongoOperators,
    ]],
    commissionerEmail: ['', [Validators.email, ...IDENTIFIER_SECURITY_VALIDATORS]],
    commissionerConatactNumber: ['', Validators.pattern(/^[6-9]\d{9}$/)],
  });

  readonly accountantForm = this.fb.nonNullable.group({
    accountantName: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(ProfileVerificationComponent.NAME_PATTERN),
      noHtmlOrScript,
      noMongoOperators,
    ]],
    accountantEmail: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254),
      ...IDENTIFIER_SECURITY_VALIDATORS,
    ]],
    accountantConatactNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
  });

  private readonly _accountantStatus = toSignal(this.accountantForm.statusChanges, {
    initialValue: this.accountantForm.status as FormControlStatus,
  });

  readonly canProceed = computed(() => this._accountantStatus() === 'VALID' && !this.isSaving());

  // ── State / MoHUA flow ───────────────────────────────────────
  readonly stateProfile = signal<StateProfile | null>(null);
  readonly editingStateProfile = signal(false);
  readonly otpStep = signal(false);
  readonly otpValue = signal('');
  readonly sendingOtp = signal(false);
  // C2 — resend cooldown countdown (seconds)
  readonly resendCooldown = signal(0);

  // ── New-user onboarding ──────────────────────────────────────
  readonly isNewUser = signal(false);
  readonly passwordStep = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  private profileSaveToken = '';

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value as string;
    const confirm = group.get('confirmPassword')?.value as string;
    return pass && confirm && pass !== confirm ? { passwordsMismatch: true } : null;
  }

  readonly passwordForm = this.fb.nonNullable.group(
    {
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(ProfileVerificationComponent.PASSWORD_PATTERN),
      ]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordsMatch },
  );

  private readonly _passwordFormStatus = toSignal(this.passwordForm.statusChanges, {
    initialValue: this.passwordForm.status as FormControlStatus,
  });

  readonly canSetNewPassword = computed(
    () => this._passwordFormStatus() === 'VALID' && !this.isSaving(),
  );

  readonly stateForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(ProfileVerificationComponent.NAME_PATTERN),
      noHtmlOrScript,
      noMongoOperators,
    ]],
    email: [{ value: '', disabled: true }],
    mobile: ['', [Validators.pattern(/^[6-9]\d{9}$/), noHtmlOrScript, noMongoOperators]],
    designation: ['', [
      Validators.maxLength(100),
      Validators.pattern(ProfileVerificationComponent.NAME_PATTERN),
      noHtmlOrScript,
      noMongoOperators,
    ]],
  });

  private readonly _stateFormStatus = toSignal(this.stateForm.statusChanges, {
    initialValue: this.stateForm.status as FormControlStatus,
  });

  readonly canSaveStateProfile = computed(
    () => this._stateFormStatus() === 'VALID' && !this.isSaving() && !this.sendingOtp(),
  );
  readonly stateFormHasErrors = computed(() => this._stateFormStatus() === 'INVALID');
  // H3 — enforce 6 numeric digits
  readonly canConfirmOtp = computed(() => /^\d{6}$/.test(this.otpValue()) && !this.isSaving());
  // C2 — resend allowed only after cooldown expires
  readonly canResend = computed(() => this.resendCooldown() === 0 && !this.sendingOtp());

  // ── Lifecycle ────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.popstateSub?.unsubscribe();
    if (this.resendTimer) window.clearInterval(this.resendTimer);
  }

  ngOnInit(): void {
    // Intercept browser back button: redirect to year selection
    history.pushState(null, '', window.location.href);
    this.popstateSub = fromEvent<PopStateEvent>(window, 'popstate').subscribe(() => {
      history.pushState(null, '', window.location.href);
      void this.router.navigate(['/xvifc/year'], { replaceUrl: true });
    });

    // H1 — validate year param; redirect if missing
    this.year = this.route.snapshot.queryParamMap.get('year') ?? '';
    if (!this.year) {
      void this.router.navigate(['/xvifc/year'], { replaceUrl: true });
      return;
    }

    this.entityId = this.route.snapshot.queryParamMap.get('entityId') ?? '';

    // M3 — parse localStorage exactly once; cache role, userId, routeRole
    const stored = this.profileService.readStoredUser();
    const rawRole = stored.role ?? '';
    this.role = ROLE_MAP[rawRole] ?? 'state';
    this.routeRole = ROUTE_ROLE_MAP[rawRole] ?? 'STATE';
    this.userId = stored._id ?? stored.id ?? '';
    this.isNewUser.set(stored['isNewUser'] === true);

    // New users must complete the onboarding flow regardless of isXVIFCProfileVerified
    if (!this.isNewUser() && this.isAlreadyVerified()) {
      void this.navigateToHome();
      return;
    }

    if (this.role === 'ulb') {
      // H4 — guard empty userId early for ULB
      if (!this.userId) {
        this.loadError.set('Unable to identify your account. Please log in again.');
        this.isLoading.set(false);
        return;
      }
      this.entityDetails.set(this.profileService.readUlbEntityInfo());
      this.loadUlbContacts();
    } else {
      this.loadStateProfile(stored);
    }
  }

  // ── ULB methods ──────────────────────────────────────────────
  private loadUlbContacts(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.profileService.getProfileContacts(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contacts) => {
          this.commissionerForm.patchValue(contacts);
          this.accountantForm.patchValue(contacts);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadError.set('Failed to load your contact details. Please check your connection and try again.');
          this.isLoading.set(false);
        },
      });
  }

  retryLoad(): void {
    if (this.role === 'ulb') {
      this.loadUlbContacts();
    } else {
      this.loadStateProfile();
    }
  }

  openEditCommissioner(): void {
    this.commissionerForm.markAsUntouched();
    this.editingCommissioner.set(true);
  }

  openEditAccountant(): void {
    this.accountantForm.markAsUntouched();
    this.editingAccountant.set(true);
  }

  onSaveAndContinue(): void {
    if (this.accountantForm.invalid) {
      this.openEditAccountant();
      return;
    }
    // H4 — guard empty userId
    if (!this.userId) {
      this.errorMsg.set('Session expired. Please log in again.');
      return;
    }
    this.isSaving.set(true);
    this.errorMsg.set('');

    this.profileService
      .saveUlbContacts(this.userId, {
        ...this.commissionerForm.getRawValue(),
        ...this.accountantForm.getRawValue(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ ok }) => {
          if (!ok) {
            this.isSaving.set(false);
            this.errorMsg.set('Failed to save contacts. Please try again.');
            return;
          }
          this.markVerifiedInStorage();
          this.snackBar.open('Profile saved successfully!', 'Close', {
            duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          void this.navigateToHome();
        },
      });
  }

  // ── State / MoHUA methods ────────────────────────────────────
  private loadStateProfile(stored?: Record<string, unknown>): void {
    const user = stored ?? this.profileService.readStoredUser();
    const profile: StateProfile = {
      name: (user['name'] as string) ?? '',
      email: (user['email'] as string) ?? '',
      mobile: ((user['mobile'] as string) ?? ''),
      designation: (user['designation'] as string) ?? '',
    };
    this.stateProfile.set(profile);
    this.stateForm.patchValue(profile);
    this.stateForm.markAllAsTouched();
    this.isLoading.set(false);
  }

  openEditStateProfile(): void {
    this.editingStateProfile.set(true);
  }

  onSaveStateProfile(): void {
    if (this.stateForm.invalid) {
      this.stateForm.markAllAsTouched();
      return;
    }
    // H2 — guard empty email
    const email = this.stateProfile()?.email ?? '';
    if (!email) {
      this.errorMsg.set('No email address found. Please log in again.');
      return;
    }
    // H4 — guard empty userId
    if (!this.userId) {
      this.errorMsg.set('Session expired. Please log in again.');
      return;
    }
    this.sendingOtp.set(true);
    this.errorMsg.set('');

    this.profileService.sendProfileOtp(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ sent }) => {
          this.sendingOtp.set(false);
          if (!sent) {
            this.errorMsg.set('Failed to send OTP. Please try again.');
            return;
          }
          this.editingStateProfile.set(false);
          this.otpStep.set(true);
          this.otpValue.set('');
          this.errorMsg.set('');
          this.startResendCooldown(); // C2
        },
      });
  }

  onConfirmOtp(): void {
    const otp = this.otpValue();
    if (!/^\d{6}$/.test(otp)) return; // H3

    const email = this.stateProfile()?.email ?? '';
    if (!email) { this.errorMsg.set('No email address found. Please log in again.'); return; }
    if (!this.userId) { this.errorMsg.set('Session expired. Please log in again.'); return; }

    const { name, mobile, designation } = this.stateForm.getRawValue();
    this.isSaving.set(true);
    this.errorMsg.set('');

    if (this.role === 'mohua') {
      // MOHUA: OTP verify → issue save token → if isNewUser: set password; else: mark verified
      this.profileService.verifyProfileOtp(email, otp).pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(({ verified }) => {
          if (!verified) {
            this.isSaving.set(false);
            this.errorMsg.set('Invalid or expired OTP. Please check your email and try again.');
          }
          return verified;
        }),
        switchMap(() => this.profileService.issueProfileSaveToken(this.userId)),
        filter(({ token }) => {
          if (!token) {
            this.isSaving.set(false);
            this.errorMsg.set('Could not secure save session. Please verify your email again.');
          }
          return token.length > 0;
        }),
      ).subscribe({
        next: ({ token }) => {
          if (this.isNewUser()) {
            this.isSaving.set(false);
            this.profileSaveToken = token;
            this.passwordStep.set(true);
          } else {
            this.profileService.saveStateProfile(this.userId, { name, mobile, designation }, token, { isXVIFCDeleted: false })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: ({ ok }) => {
                  if (!ok) {
                    this.isSaving.set(false);
                    this.errorMsg.set('Profile save failed. Please try again.');
                    return;
                  }
                  this.markVerifiedInStorage();
                  this.snackBar.open('Email verified successfully!', 'Close', {
                    duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
                    panelClass: ['snack-success'],
                  });
                  void this.navigateToHome();
                },
              });
          }
        },
      });
      return;
    }

    // STATE: OTP verify → issue save token → if isNewUser: show password step; else: save profile
    this.profileService.verifyProfileOtp(email, otp).pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(({ verified }) => {
        if (!verified) {
          this.isSaving.set(false);
          this.errorMsg.set('Invalid or expired OTP. Please check your email and try again.');
        }
        return verified;
      }),
      switchMap(() => this.profileService.issueProfileSaveToken(this.userId)),
      filter(({ token }) => {
        if (!token) {
          this.isSaving.set(false);
          this.errorMsg.set('Could not secure save session. Please verify your email again.');
        }
        return token.length > 0;
      }),
    ).subscribe({
      next: ({ token }) => {
        if (this.isNewUser()) {
          this.isSaving.set(false);
          this.profileSaveToken = token;
          this.passwordStep.set(true);
        } else {
          this.profileService.saveStateProfile(this.userId, { name, mobile, designation }, token)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: ({ ok }) => {
                if (!ok) {
                  this.isSaving.set(false);
                  this.errorMsg.set('Profile save failed. Please try again.');
                  return;
                }
                this.stateProfile.set({ name, mobile, designation, email });
                this.markVerifiedInStorage({ name, mobile, designation });
                this.snackBar.open('Profile verified successfully!', 'Close', {
                  duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
                  panelClass: ['snack-success'],
                });
                void this.navigateToHome();
              },
            });
        }
      },
    });
  }

  onSetNewPassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { newPassword } = this.passwordForm.getRawValue();
    const { name, mobile, designation } = this.stateForm.getRawValue();
    const email = this.stateProfile()?.email ?? '';
    this.isSaving.set(true);
    this.errorMsg.set('');

    const token = this.profileSaveToken;

    if (this.role === 'mohua') {
      this.profileService.setNewPassword(newPassword, token)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ ok }) => {
            if (!ok) { this.isSaving.set(false); this.errorMsg.set('Failed to set password. Please try again.'); return; }
            this.markVerifiedInStorage({ name, mobile, designation });
            this.snackBar.open('Password set! Welcome to CityFinance.', 'Close', {
              duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
              panelClass: ['snack-success'],
            });
            void this.navigateToHome();
          },
        });
      return;
    }

    // STATE: set password then save profile using the stored save token
    this.profileService.setNewPassword(newPassword, token).pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(({ ok }) => {
        if (!ok) { this.isSaving.set(false); this.errorMsg.set('Failed to set password. Please try again.'); }
        return ok;
      }),
      switchMap(() =>
        this.profileService.saveStateProfile(this.userId, { name, mobile, designation }, token),
      ),
    ).subscribe({
      next: ({ ok }) => {
        if (!ok) { this.isSaving.set(false); this.errorMsg.set('Profile save failed. Please try again.'); return; }
        this.stateProfile.set({ name, mobile, designation, email });
        this.markVerifiedInStorage({ name, mobile, designation });
        this.snackBar.open('Profile verified successfully!', 'Close', {
          duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
        void this.navigateToHome();
      },
    });
  }

  resendOtp(): void {
    if (!this.canResend()) return;
    this.otpStep.set(false);
    this.otpValue.set('');
    this.onSaveStateProfile();
  }

  // L4 — typed event handler (no $any); H3 — strip non-digits
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = digits;
    this.otpValue.set(digits);
  }

  // C2 — 60-second countdown before resend is allowed
  private startResendCooldown(): void {
    if (this.resendTimer) window.clearInterval(this.resendTimer);
    this.resendCooldown.set(60);
    this.resendTimer = window.setInterval(() => {
      const next = this.resendCooldown() - 1;
      this.resendCooldown.set(next);
      if (next <= 0) window.clearInterval(this.resendTimer);
    }, 1000);
  }

  // ── Storage helpers ───────────────────────────────────────────
  private isAlreadyVerified(): boolean {
    try {
      if (localStorage.getItem('isXVIFCProfileVerified') === 'true') return true;
      const raw = localStorage.getItem('userData');
      if (raw) {
        const user = JSON.parse(raw) as { isXVIFCProfileVerified?: boolean };
        return user.isXVIFCProfileVerified === true;
      }
    } catch { /* ignore */ }
    return false;
  }

  private markVerifiedInStorage(profileUpdates?: { name?: string; mobile?: string; designation?: string }): void {
    localStorage.setItem('isXVIFCProfileVerified', 'true');
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const user = JSON.parse(raw) as Record<string, unknown>;
        user['isXVIFCProfileVerified'] = true;
        user['isNewUser'] = false;
        if (profileUpdates) {
          if (profileUpdates.name !== undefined) user['name'] = profileUpdates.name;
          if (profileUpdates.mobile !== undefined) user['mobile'] = profileUpdates.mobile;
          if (profileUpdates.designation !== undefined) user['designation'] = profileUpdates.designation;
        }
        localStorage.setItem('userData', JSON.stringify(user));
      }
    } catch { /* ignore */ }
  }

  private navigateToHome(): Promise<boolean> {
    if (this.role === 'mohua') {
      return this.router.navigate(['/xvifc', this.year], { replaceUrl: true });
    }
    return this.router.navigate(
      buildXvifcFeatureLink(this.routeRole, this.entityId, this.year, 'overview'),
      { replaceUrl: true },
    );
  }
}
