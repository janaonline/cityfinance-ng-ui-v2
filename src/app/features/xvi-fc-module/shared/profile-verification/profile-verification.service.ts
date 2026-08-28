import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { StateProfile, UlbContacts, UlbEntityInfo } from './profile-verification.models';

interface StoredUserData {
  _id?: string;
  id?: string;
  role?: string;
  ulb?: string;
  state?: string;
  name?: string;
  email?: string;
  mobile?: string | null;
  designation?: string;
  stateName?: string;
  ulbCode?: string;
  ulbType?: string;
  censusCode?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class ProfileVerificationService {
  constructor(private http: HttpClient) {}

  getProfileContacts(userId: string): Observable<UlbContacts> {
    return this.http
      .get<{ success: boolean; data: UlbContacts }>(`${environment.api.url2}users/${userId}/profile-contacts`)
      .pipe(map((resp) => resp?.data ?? (resp as unknown as UlbContacts)));
  }

  saveUlbContacts(
    userId: string,
    contacts: UlbContacts,
    saveToken: string,
  ): Observable<{ ok: boolean; fieldErrors?: Record<string, string> }> {
    return this.http
      .patch(`${environment.api.url2}users/${userId}/profile-contacts`, {
        ...contacts,
        saveToken,
        isXVIFCProfileVerified: true,
        // saveUlbContacts() is only ever called after the Nodal Officer's OTP has been verified —
        // saveToken is the backend's actual proof of that (see issueProfileSaveToken).
        isXviFcEmailVerified: true,
      })
      .pipe(
        map(() => ({ ok: true })),
        catchError((err: unknown) => {
          const fieldErrors: Record<string, string> = {};
          if (err instanceof HttpErrorResponse) {
            const errors = err.error?.errors as Record<string, { message: string }[]> | undefined;
            if (errors) {
              for (const [field, entries] of Object.entries(errors)) {
                if (entries?.[0]?.message) fieldErrors[field] = entries[0].message;
              }
            }
          }
          return of({ ok: false, fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined });
        }),
      );
  }

  /** Checks the email's domain can plausibly receive mail, with no side effects — lets a caller
   *  catch a typo'd/made-up domain up front, before spending an OTP send on it. */
  checkEmailDomain(email: string): Observable<{ deliverable: boolean }> {
    return this.http
      .post<{ success?: boolean; data?: { deliverable: boolean }; deliverable?: boolean }>(
        `${environment.api.url2}email/checkEmailDomain`,
        { email },
      )
      .pipe(
        map((resp) => ({ deliverable: (resp?.data ?? resp)?.deliverable === true })),
        // Fail open — a transient check failure shouldn't block a save that the final MX check
        // (already enforced server-side at save time) would otherwise have allowed.
        catchError(() => of({ deliverable: true })),
      );
  }

  sendProfileOtp(email: string): Observable<{ sent: boolean }> {
    return this.http
      .post<{ success?: boolean; data?: { isOtpSent: boolean }; isOtpSent?: boolean }>(
        `${environment.api.url2}email/sendProfileOtp`,
        { email },
      )
      .pipe(
        map((resp) => ({ sent: (resp?.data ?? resp)?.isOtpSent === true })),
        catchError(() => of({ sent: false })),
      );
  }

  verifyProfileOtp(email: string, otp: string): Observable<{ verified: boolean }> {
    return this.http
      .post<{ success?: boolean; data?: { isOtpVerified: boolean }; isOtpVerified?: boolean }>(
        `${environment.api.url2}email/verifyProfileOtp`,
        { email, otp },
      )
      .pipe(
        map((resp) => ({ verified: (resp?.data ?? resp)?.isOtpVerified === true })),
        catchError(() => of({ verified: false })),
      );
  }

  issueProfileSaveToken(userId: string): Observable<{ token: string }> {
    return this.http
      .post<{ success?: boolean; data?: { token: string }; token?: string }>(
        `${environment.api.url2}users/${userId}/issue-profile-save-token`,
        {},
      )
      .pipe(
        map((resp) => ({ token: (resp?.data ?? resp)?.token ?? '' })),
        catchError(() => of({ token: '' })),
      );
  }

  saveStateProfile(
    userId: string,
    profile: Pick<StateProfile, 'name' | 'mobile' | 'designation'>,
    saveToken: string,
    extraFields?: Record<string, unknown>,
  ): Observable<{ ok: boolean }> {
    return this.http
      .patch(`${environment.api.url2}users/${userId}/profile-contacts`, {
        name: profile.name,
        mobile: profile.mobile,
        designation: profile.designation,
        saveToken,
        isXVIFCProfileVerified: true,
        // saveStateProfile() is only ever called after verifyProfileOtp() has succeeded.
        isXviFcEmailVerified: true,
        ...extraFields,
      })
      .pipe(
        map(() => ({ ok: true })),
        catchError(() => of({ ok: false })),
      );
  }

  setNewPassword(
    newPassword: string,
    saveToken: string,
    profile?: { name?: string; mobile?: string; designation?: string },
  ): Observable<{ ok: boolean }> {
    return this.http
      .patch(`${environment.api.url2}auth/set-new-password`, { newPassword, saveToken, ...profile })
      .pipe(
        map(() => ({ ok: true })),
        catchError(() => of({ ok: false })),
      );
  }

  readStoredUser(): StoredUserData {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? (JSON.parse(raw) as StoredUserData) : {};
    } catch { return {}; }
  }

  readStateProfile(): StateProfile {
    const user = this.readStoredUser();
    return {
      name: user.name ?? '',
      email: user.email ?? '',
      mobile: user.mobile ?? '',
      designation: user.designation ?? '',
    };
  }

  readUlbEntityInfo(): UlbEntityInfo | null {
    const user = this.readStoredUser();
    if (!user.name) return null;
    return {
      name: user.name,
      ulbCode: user.ulbCode,
      censusCode: user.censusCode,
      ulbType: user.ulbType,
      stateName: user.stateName,
    };
  }
}
