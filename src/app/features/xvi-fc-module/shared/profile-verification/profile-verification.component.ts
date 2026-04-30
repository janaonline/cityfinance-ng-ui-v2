import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileVerificationService } from './profile-verification.service';
import { ProfileVerificationPayload } from './profile-verification.models';

type ProfileRole = 'state' | 'ulb' | 'mohua';

const ROLE_MAP: Record<string, ProfileRole> = {
  STATE: 'state',
  XVIFC_STATE: 'state',
  ULB: 'ulb',
  XVIFC: 'ulb',
  MoHUA: 'mohua',
};

@Component({
  selector: 'app-profile-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
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
  stateName = '';
  ulbName = '';
  ulbCode = '';
  ulbType = '';
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  private year = '';
  private entityId = '';

  form = this.fb.group({
    contactPersonName: [''],
    designation: [''],
    officialEmail: ['', Validators.email],
    mobileNumber: [''],
  });

  ngOnInit(): void {
    this.year = this.route.snapshot.queryParamMap.get('year') ?? '';
    this.entityId = this.route.snapshot.queryParamMap.get('entityId') ?? '';
    this.role = this.getRoleFromLocalStorage();
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getProfile(this.role).subscribe({
      next: (profile) => {
        this.stateName = profile.stateName;
        this.ulbName = profile.ulbName ?? '';
        this.ulbCode = profile.ulbCode ?? '';
        this.ulbType = profile.ulbType ?? '';
        this.form.patchValue({
          contactPersonName: profile.contactPersonName,
          designation: profile.designation,
          officialEmail: profile.officialEmail,
          mobileNumber: profile.mobileNumber,
        });
        this.form.markAsPristine();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onConfirm(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const controls = this.form.controls;

    const payload: ProfileVerificationPayload = { isXVIFCProfileVerified: true };
    if (controls.contactPersonName.dirty) {
      payload.contactPersonName = controls.contactPersonName.value as string;
    }
    if (controls.designation.dirty) {
      payload.designation = controls.designation.value as string;
    }
    if (controls.officialEmail.dirty) {
      payload.officialEmail = controls.officialEmail.value as string;
    }
    if (controls.mobileNumber.dirty) {
      payload.mobileNumber = controls.mobileNumber.value as string;
    }

    this.profileService.confirmProfile(payload).subscribe({
      next: (res) => {
        localStorage.setItem('isXVIFCProfileVerified', 'true');
        try {
          const raw = localStorage.getItem('userData');
          if (raw) {
            const userData = JSON.parse(raw);
            userData.isXVIFCProfileVerified = true;
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        } catch { /* ignore */ }
        this.snackBar.open(res.message ?? 'Profile verified successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/xvifc', this.entityId, this.year, 'overview'], { replaceUrl: true });
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to save profile. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  private getRoleFromLocalStorage(): ProfileRole {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return 'state';
      const user = JSON.parse(raw) as { role: string };
      return ROLE_MAP[user.role] ?? 'state';
    } catch {
      return 'state';
    }
  }
}
