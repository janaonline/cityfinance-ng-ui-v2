import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  EntityProfilesResponse,
  ProfileItem,
  ProfileVerificationApiResponse,
  ProfileVerificationPayload,
} from './profile-verification.models';

interface StoredUserData {
  name?: string;
  email?: string;
  mobile?: string | null;
  designation?: string;
  stateName?: string;
  ulbCode?: string;
  ulbType?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileVerificationService {
  constructor(private http: HttpClient) {}

  getEntityProfiles(role: 'state' | 'ulb' | 'mohua'): Observable<EntityProfilesResponse> {
    const user = this.readStoredUser();
    return this.http
      .get<ProfileItem[]>(`${environment.api.url2}auth/entity-profiles?role=${role}`)
      .pipe(
        map((profiles) => ({
          entityName: role === 'ulb' ? (user.name ?? '') : (user.stateName ?? ''),
          entityCode: user.ulbCode,
          entityType: user.ulbType,
          stateName: user.stateName ?? '',
          profiles: profiles.map((p, i) => ({
            ...p,
            id: p.id ?? p.email ?? `profile-${i}`,
            designation: p.designation || p.designantion || '',
          })),
        })),
        catchError(() => of(this.buildFallbackProfiles(role))),
      );
  }

  sendProfileOtp(mobile: string): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(
      `${environment.api.url2}auth/send-verification-otp`,
      { mobile },
    );
  }

  getProfile(role: 'state' | 'ulb' | 'mohua'): Observable<ProfileVerificationApiResponse> {
    const user = this.readStoredUser();
    const base: ProfileVerificationApiResponse = {
      stateName: user.stateName ?? '',
      designation: user.designation ?? '',
      officialEmail: user.email ?? '',
      mobileNumber: user.mobile ?? '',
      contactPersonName: user.name ?? '',
    };
    if (role === 'ulb') {
      return of({
        ...base,
        ulbName: user.name ?? '',
        ulbCode: user.ulbCode ?? '',
        ulbType: user.ulbType ?? '',
        contactPersonName: user.name ?? '',
        designation: user.designation ?? '',
      });
    }
    return of(base);
  }

  confirmProfile(
    payload: ProfileVerificationPayload,
  ): Observable<{ success: boolean; message?: string }> {
    return this.http.patch<{ success: boolean; message?: string }>(
      `${environment.api.url2}auth/update-profile`,
      payload,
    );
  }

  private buildFallbackProfiles(role: 'state' | 'ulb' | 'mohua'): EntityProfilesResponse {
    const user = this.readStoredUser();
    const profile: ProfileItem = {
      id: '1',
      name: user.name ?? '',
      designation: user.designation ?? '',
      email: user.email ?? '',
      mobile: user.mobile ?? '',
    };
    return {
      entityName: role === 'ulb' ? (user.name ?? '') : (user.stateName ?? ''),
      entityCode: user.ulbCode,
      entityType: user.ulbType,
      stateName: user.stateName ?? '',
      profiles: profile.name ? [profile] : [],
    };
  }

  private readStoredUser(): StoredUserData {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? (JSON.parse(raw) as StoredUserData) : {};
    } catch {
      return {};
    }
  }
}
