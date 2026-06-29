import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControlStatus } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
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
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileVerificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  role: ProfileRole = 'state';
  private year = '';
  private entityId = '';

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
    designation: ['', [Validators.maxLength(100), Validators.pattern(ProfileVerificationComponent.NAME_PATTERN), noHtmlOrScript, noMongoOperators]],
  });

  private readonly _stateFormStatus = toSignal(this.stateForm.statusChanges, {
    initialValue: this.stateForm.status as FormControlStatus,
  });

  readonly canSaveStateProfile = computed(
    () => this._stateFormStatus() === 'VALID' && !this.isSaving() && !this.sendingOtp(),
  );
  readonly stateFormHasErrors = computed(() => this._stateFormStatus() === 'INVALID');
  readonly canConfirmOtp = computed(() => this.otpValue().trim().length === 6 && !this.isSaving());

  // ── Lifecycle ────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.popstateSub?.unsubscribe();
  }

  ngOnInit(): void {
    // Intercept browser back button: redirect to year selection instead of going back in history
    history.pushState(null, '', window.location.href);
    this.popstateSub = fromEvent<PopStateEvent>(window, 'popstate').subscribe(() => {
      history.pushState(null, '', window.location.href);
      void this.router.navigate(['/xvifc/year'], { replaceUrl: true });
    });

    this.year = this.route.snapshot.queryParamMap.get('year') ?? '';
    this.entityId = this.route.snapshot.queryParamMap.get('entityId') ?? '';
    this.role = this.getRoleFromStorage();

    if (this.isAlreadyVerified()) {
      void this.navigateToHome();
      return;
    }

    if (this.role === 'ulb') {
      this.entityDetails.set(this.profileService.readUlbEntityInfo());
      this.loadUlbContacts();
    } else {
      this.loadStateProfile();
    }
  }

  // ── ULB methods ──────────────────────────────────────────────
  private loadUlbContacts(): void {
    const userId = this.getLoggedInUserId();
    if (!userId) {
      this.loadError.set('Unable to identify your account. Please log in again.');
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.loadError.set('');
    this.profileService.getProfileContacts(userId).subscribe({
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
    const userId = this.getLoggedInUserId();
    this.isSaving.set(true);
    this.errorMsg.set('');

    this.profileService
      .saveUlbContacts(userId, {
        ...this.commissionerForm.getRawValue(),
        ...this.accountantForm.getRawValue(),
      })
      .subscribe({
        next: () => {
          this.markVerifiedInStorage();
          this.snackBar.open('Profile saved successfully!', 'Close', {
            duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          void this.navigateToHome();
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMsg.set('Failed to save contacts. Please try again.');
        },
      });
  }

  // ── State / MoHUA methods ────────────────────────────────────
  private loadStateProfile(): void {
    const profile = this.profileService.readStateProfile();
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
    const email = this.stateProfile()?.email ?? '';
    this.sendingOtp.set(true);
    this.errorMsg.set('');

    this.profileService.sendProfileOtp(email).subscribe({
      next: () => {
        this.sendingOtp.set(false);
        this.editingStateProfile.set(false);
        this.otpStep.set(true);
        this.otpValue.set('');
        this.errorMsg.set('');
      },
      error: () => {
        this.sendingOtp.set(false);
        this.errorMsg.set('Failed to send OTP. Please try again.');
      },
    });
  }

  onConfirmOtp(): void {
    const otp = this.otpValue().trim();
    if (otp.length !== 6) return;

    const email = this.stateProfile()?.email ?? '';
    this.isSaving.set(true);
    this.errorMsg.set('');

    this.profileService.verifyProfileOtp(email, otp).subscribe({
      next: ({ verified }) => {
        if (!verified) {
          this.isSaving.set(false);
          this.errorMsg.set('Invalid or expired OTP. Please check your email and try again.');
          return;
        }

        const userId = this.getLoggedInUserId();
        const { name, mobile, designation } = this.stateForm.getRawValue();

        this.profileService.saveStateProfile(userId, { name, mobile, designation }).subscribe({
          next: () => {
            this.markVerifiedInStorage({ name, mobile, designation });
            this.snackBar.open('Profile verified successfully!', 'Close', {
              duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
              panelClass: ['snack-success'],
            });
            void this.navigateToHome();
          },
          error: () => {
            this.isSaving.set(false);
            this.errorMsg.set('Profile save failed. Please try again.');
          },
        });
      },
    });
  }

  resendOtp(): void {
    this.otpStep.set(false);
    this.otpValue.set('');
    this.onSaveStateProfile();
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
    return this.router.navigate(
      buildXvifcFeatureLink(this.getRouteRoleFromStorage(), this.entityId, this.year, 'overview'),
      { replaceUrl: true },
    );
  }

  private getLoggedInUserId(): string {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return '';
      const user = JSON.parse(raw) as { _id?: string; id?: string };
      return user._id ?? user.id ?? '';
    } catch { return ''; }
  }

  private getRoleFromStorage(): ProfileRole {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return 'state';
      const user = JSON.parse(raw) as { role: string };
      return ROLE_MAP[user.role] ?? 'state';
    } catch { return 'state'; }
  }

  private getRouteRoleFromStorage(): Roles {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return 'STATE';
      const user = JSON.parse(raw) as { role: string };
      return ROUTE_ROLE_MAP[user.role] ?? 'STATE';
    } catch { return 'STATE'; }
  }
}
