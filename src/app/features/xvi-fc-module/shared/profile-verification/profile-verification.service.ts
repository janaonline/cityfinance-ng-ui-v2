import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityProfilesResponse, ProfileItem } from './profile-verification.models';

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
          const profiles = (payload?.data ?? []).map((p: ProfileItem, i: number) => {
            const raw = p as unknown as Record<string, unknown>;
            const id =
              (raw['_id'] as string | undefined) ??
              (raw['id'] as string | undefined) ??
              `profile-${i}`;
            return { ...p, id, designation: p.designation || p.designantion || '' };
          });
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

  sendMobileVerifyOtp(mobile: string): Observable<{ success?: boolean; message?: string; mobile?: string }> {
    return this.http.post<{ success?: boolean; message?: string; mobile?: string }>(
      `${environment.api.url2}auth/sendOtp`,
      { identifier: mobile, purpose: 'mobile-verify' },
    );
  }

  verifyMobileOtp(mobile: string, otp: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.api.url2}auth/verifyMobileOtp`, { identifier: mobile, otp });
  }

  updateProfileContacts(
    id: string,
    name: string,
    mobile: string,
    designation: string,
    email?: string,
  ): Observable<{ success: boolean }> {
    const body: Record<string, unknown> = { name, mobile, designation, isXVIFCProfileVerified: true };
    // email is intentionally omitted for STATE users — it is their login credential
    // and must never be overwritten. The backend enforces this too, but we avoid
    // sending it in the first place to prevent accidental overwrites.
    if (email !== undefined) {
      body['email'] = email;
    }
    return this.http.patch<{ success: boolean }>(`${environment.api.url2}users/${id}/profile-contacts`, body);
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
