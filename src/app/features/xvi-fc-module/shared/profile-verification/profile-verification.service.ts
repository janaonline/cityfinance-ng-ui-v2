import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { StateProfile, UlbContacts, UlbEntityInfo } from './profile-verification.models';

interface StoredUserData {
  _id?: string;
  id?: string;
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

  saveUlbContacts(userId: string, contacts: UlbContacts): Observable<unknown> {
    return this.http.patch(`${environment.api.url2}users/${userId}/profile-contacts`, {
      ...contacts,
      isXVIFCProfileVerified: true,
    });
  }

  sendProfileOtp(email: string): Observable<unknown> {
    return this.http.post(`${environment.api.url2}email/sendOtp`, { email });
  }

  verifyProfileOtp(email: string, otp: string): Observable<{ verified: boolean }> {
    return this.http
      .post<{ success: boolean; data: { isOtpVerified: boolean } }>(
        `${environment.api.url2}email/verifyOtp`,
        { email, otp },
      )
      .pipe(
        map((resp) => ({ verified: resp?.data?.isOtpVerified === true })),
        catchError(() => of({ verified: false })),
      );
  }

  saveStateProfile(
    userId: string,
    profile: Pick<StateProfile, 'name' | 'mobile' | 'designation'>,
  ): Observable<unknown> {
    return this.http.patch(`${environment.api.url2}users/${userId}/profile-contacts`, {
      name: profile.name,
      mobile: profile.mobile,
      designation: profile.designation,
      isXVIFCProfileVerified: true,
    });
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
