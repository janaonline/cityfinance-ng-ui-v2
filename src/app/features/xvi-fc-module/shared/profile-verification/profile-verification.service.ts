import { HttpClient, HttpParams } from '@angular/common/http';
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
  [key: string]: unknown;
}

interface UsersListResponse {
  success: boolean;
  data: {
    ulbDetails?: { name?: string; code?: string; stateName?: string };
    stateDetails?: { name?: string; code?: string; stateName?: string };
    data: ProfileItem[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProfileVerificationService {
  constructor(private http: HttpClient) {}

  getEntityProfiles(role: 'state' | 'ulb' | 'mohua'): Observable<EntityProfilesResponse> {
    const user = this.readStoredUser();
    const paramKey = role === 'state' ? 'stateId' : 'ulbId';
    const entityId = role === 'state' ? (user.state ?? '') : (user.ulb ?? '');
    const params = new HttpParams().set(paramKey, entityId);

    return this.http
      .get<any>(`${environment.api.url2}users/list`, { params })
      .pipe(
        map((resp) => {
          const payload: UsersListResponse['data'] =
            resp?.data && !Array.isArray(resp.data) && typeof resp.data === 'object'
              ? resp.data
              : (resp as unknown as UsersListResponse['data']);
          const details = payload?.ulbDetails ?? payload?.stateDetails;
          const profiles = (payload?.data ?? []).map((p: ProfileItem, i: number) => ({
            ...p,
            id: p.id ?? `profile-${i}`,
            designation: p.designation || p.designantion || '',
          }));
          return {
            entityName: details?.name ?? user.name ?? '',
            entityCode: details?.code ?? user.ulbCode,
            entityType: user.ulbType,
            stateName: details?.stateName ?? user.stateName ?? '',
            profiles,
          };
        }),
        catchError(() => of(this.buildFallbackProfiles(role))),
      );
  }

  sendProfileOtp(mobile: string): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(
      `${environment.api.url2}auth/sendOtp`,
      { identifier: mobile, purpose: 'login' },
    );
  }

  verifyOtp(mobile: string, otp: string): Observable<{ success?: boolean; message?: string }> {
    return this.http.post<{ success?: boolean; message?: string }>(
      `${environment.api.url2}auth/verifyOtp`,
      { identifier: mobile, otp },
    );
  }

  updateProfileContacts(
    name: string,
    email: string,
    mobile: string,
  ): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(
      `${environment.api.url2}users/update-profile-contacts`,
      { name, email, mobile, isXVIFCProfileVerified: true },
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
