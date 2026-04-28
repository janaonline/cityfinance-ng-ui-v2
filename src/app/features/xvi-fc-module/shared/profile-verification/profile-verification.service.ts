import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ProfileVerificationApiResponse, ProfileVerificationPayload } from './profile-verification.models';

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
  constructor(private http: HttpClient) { }
  getProfile(role: 'state' | 'ulb' | 'mohua'): Observable<ProfileVerificationApiResponse> {
    const user = this.readStoredUser();

    const base: ProfileVerificationApiResponse = {
      stateName: user.stateName ?? '',
      designation: user.designation ?? '',
      officialEmail: user.email ?? '',
      mobileNumber: user.mobile ?? '',
      // For STATE/MOHUA, name is the admin/contact person name
      contactPersonName: user.name ?? '',
    };

    if (role === 'ulb') {
      return of({
        ...base,
        // For ULB, name holds the organisation name, not the contact person
        ulbName: user.name ?? '',
        ulbCode: user.ulbCode ?? '',
        ulbType: user.ulbType ?? '',
        contactPersonName: user.name ?? '',
        designation: user.designation ?? '',
      });
    }

    return of(base);
  }

  confirmProfile(payload: ProfileVerificationPayload): Observable<{ success: boolean; message?: string }> {
    return this.http.patch<{ success: boolean; message?: string }>(`${environment.api.url2}auth/update-profile`, payload);
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
