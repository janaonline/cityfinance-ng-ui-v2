import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileVerificationService } from './profile-verification.service';
import { EntityProfilesResponse, ProfileItem } from './profile-verification.models';
import { buildXvifcFeatureLink, Roles } from '../../xvi-fc-side-menu.config';

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
  ],
  templateUrl: './profile-verification.component.html',
  styleUrl: './profile-verification.component.scss',
})
export class ProfileVerificationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileVerificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  role: ProfileRole = 'state';
  private year = '';
  private entityId = '';

  readonly entityInfo = signal<EntityProfilesResponse | null>(null);
  readonly isLoading = signal(true);
  readonly errorMsg = signal('');

  // OTP flow per-profile
  readonly expandedKey = signal<string | null>(null);
  readonly sendingOtpKey = signal<string | null>(null);
  readonly otpSentKey = signal<string | null>(null);
  readonly verifyingKey = signal<string | null>(null);
  readonly editedMobiles = signal<Record<string, string>>({});
  readonly editedEmails = signal<Record<string, string>>({});
  readonly otpValues = signal<Partial<Record<string, string>>>({});

  // Add-form
  readonly showAddForm = signal(false);
  readonly addFormSubmitting = signal(false);

  readonly skeletonRows = [1, 2, 3];

  addForm = this.fb.group({
    name: ['', Validators.required],
    designation: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
  });

  ngOnInit(): void {
    this.year = this.route.snapshot.queryParamMap.get('year') ?? '';
    this.entityId = this.route.snapshot.queryParamMap.get('entityId') ?? '';
    this.role = this.getRoleFromStorage();

    if (this.isAlreadyVerified()) {
      void this.navigateToHome();
      return;
    }

    this.loadProfiles();
  }

  loadProfiles(): void {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.profileService.getEntityProfiles(this.role).subscribe({
      next: (data) => {
        this.entityInfo.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load profiles. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Profile key ──────────────────────────────────────────────
  getProfileKey(profile: ProfileItem): string {
    return profile.id ?? `${profile.email ?? ''}_${profile.mobile ?? ''}`;
  }

  // ── Mobile / email edit ───────────────────────────────────────
  getMobile(profile: ProfileItem): string {
    return this.editedMobiles()[this.getProfileKey(profile)] ?? profile.mobile;
  }

  getEmail(profile: ProfileItem): string {
    return this.editedEmails()[this.getProfileKey(profile)] ?? profile.email ?? '';
  }

  onMobileInput(key: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.editedMobiles.update((m) => ({ ...m, [key]: val }));
  }

  onEmailInput(key: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.editedEmails.update((e) => ({ ...e, [key]: val }));
  }

  onOtpInput(key: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.otpValues.update((v) => ({ ...v, [key]: val }));
  }

  // ── OTP flow ──────────────────────────────────────────────────
  toggleExpand(key: string): void {
    const prev = this.expandedKey();
    this.expandedKey.update((k) => (k === key ? null : key));
    // Reset OTP state whenever we collapse OR switch to a different card
    if (prev !== this.expandedKey()) {
      this.otpSentKey.set(null);
      this.sendingOtpKey.set(null);
    }
    this.errorMsg.set('');
  }

  sendOtp(profile: ProfileItem): void {
    const key = this.getProfileKey(profile);
    if (this.expandedKey() !== key) return;
    const mobile = this.getMobile(profile);
    const email = this.getEmail(profile);
    if (!mobile || mobile.length < 10) {
      this.errorMsg.set('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMsg.set('Please enter a valid email address.');
      return;
    }
    this.sendingOtpKey.set(key);
    this.errorMsg.set('');
    this.profileService.sendProfileOtp(mobile).subscribe({
      next: () => {
        this.otpSentKey.set(key);
        this.sendingOtpKey.set(null);
      },
      error: (err: unknown) => {
        this.errorMsg.set(
          (err as { error?: { message?: string } })?.error?.message ??
            'Failed to send OTP. Please try again.',
        );
        this.sendingOtpKey.set(null);
      },
    });
  }

  confirmVerify(profile: ProfileItem): void {
    const key = this.getProfileKey(profile);
    if (this.expandedKey() !== key) return;
    const otp = this.otpValues()[key] ?? '';
    if (!otp || otp.length < 4) {
      this.errorMsg.set('Please enter the OTP sent to your mobile.');
      return;
    }
    const mobile = this.getMobile(profile);
    const email = this.getEmail(profile);
    this.verifyingKey.set(key);
    this.errorMsg.set('');
    this.profileService
      .verifyOtp(mobile, otp)
      .pipe(
        switchMap(() =>
          this.profileService.updateProfileContacts(profile.id!, email, mobile),
        ),
      )
      .subscribe({
        next: () => {
          this.markVerifiedInStorage();
          this.snackBar.open('Profile verified successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          void this.navigateToHome();
        },
        error: (err: unknown) => {
          this.errorMsg.set(
            (err as { error?: { message?: string } })?.error?.message ??
              'Verification failed. Please try again.',
          );
          this.verifyingKey.set(null);
        },
      });
  }

  // ── Add form ──────────────────────────────────────────────────
  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
  }

  submitAddForm(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const val = this.addForm.value;
    this.addFormSubmitting.set(true);
    this.profileService
      .createManagedUser({
        name: val.name ?? '',
        username: val.name ?? '',
        designation: val.designation ?? '',
        email: val.email ?? '',
        mobile: val.mobile ?? '',
        role: 'ULB',
      })
      .subscribe({
        next: () => {
          this.markVerifiedInStorage();
          this.snackBar.open('Account created successfully!', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          void this.navigateToHome();
        },
        error: (err: unknown) => {
          this.errorMsg.set(
            (err as { error?: { message?: string } })?.error?.message ??
              'Submission failed. Please try again.',
          );
          this.addFormSubmitting.set(false);
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0] ?? '')
      .join('')
      .toUpperCase();
  }

  getRoleBadgeLabel(): string {
    if (this.role === 'ulb') return 'ULB';
    if (this.role === 'mohua') return 'MoHUA';
    return 'State';
  }

  getRoleIcon(): string {
    if (this.role === 'ulb') return 'bi-bank2';
    if (this.role === 'mohua') return 'bi-buildings-fill';
    return 'bi-geo-alt-fill';
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
    } catch {
      /* ignore */
    }
    return false;
  }

  private markVerifiedInStorage(): void {
    localStorage.setItem('isXVIFCProfileVerified', 'true');
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const user = JSON.parse(raw) as Record<string, unknown>;
        user['isXVIFCProfileVerified'] = true;
        localStorage.setItem('userData', JSON.stringify(user));
      }
    } catch {
      /* ignore */
    }
  }

  private navigateToHome(): Promise<boolean> {
    return this.router.navigate(
      buildXvifcFeatureLink(this.getRouteRoleFromStorage(), this.entityId, this.year, 'overview'),
      { replaceUrl: true },
    );
  }

  private getRoleFromStorage(): ProfileRole {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return 'state';
      const user = JSON.parse(raw) as { role: string };
      return ROLE_MAP[user.role] ?? 'state';
    } catch {
      return 'state';
    }
  }

  private getRouteRoleFromStorage(): Roles {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return 'STATE';
      const user = JSON.parse(raw) as { role: string };
      return ROUTE_ROLE_MAP[user.role] ?? 'STATE';
    } catch {
      return 'STATE';
    }
  }
}
