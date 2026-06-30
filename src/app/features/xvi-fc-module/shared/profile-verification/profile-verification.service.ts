import { HttpClient } from '@angular/common/http';
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

  saveUlbContacts(userId: string, contacts: UlbContacts): Observable<{ ok: boolean }> {
    return this.http
      .patch(`${environment.api.url2}users/${userId}/profile-contacts`, {
        ...contacts,
        isXVIFCProfileVerified: true,
      })
      .pipe(
        map(() => ({ ok: true })),
        catchError(() => of({ ok: false })),
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
  ): Observable<{ ok: boolean }> {
    return this.http
      .patch(`${environment.api.url2}users/${userId}/profile-contacts`, {
        name: profile.name,
        mobile: profile.mobile,
        designation: profile.designation,
        saveToken,
        isXVIFCProfileVerified: true,
      })
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
