import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../../../../environments/environment';
import { UlbContacts } from '../../shared/profile-verification/profile-verification.models';
import { ProfileVerificationService } from '../../shared/profile-verification/profile-verification.service';
import { PageErrorStateComponent } from '../../shared/page-error-state/page-error-state.component';
import {
  IDENTIFIER_SECURITY_VALIDATORS,
  noHtmlOrScript,
  noMongoOperators,
} from '../../../../auth/validators/auth-security.validators';

type ContactType = 'commissioner' | 'accountant';

interface UlbBandInfo {
  name: string;
  code: string;
  stateName: string;
  initials: string;
}

interface RegisteredMunicipalInfo {
  stateName: string;
  ulbType: string;
  censusCode: string;
  ulbCode: string;
  area: number | null;
  population: number | null;
  wards: number | null;
}

interface ProfileContactsApiResponse extends UlbContacts {
  ulbDetails?: { name: string; code: string; stateName: string } | null;
  registeredMunicipalInfo?: RegisteredMunicipalInfo | null;
}

@Component({
  selector: 'app-roles-teams-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    PageErrorStateComponent,
  ],
  templateUrl: './roles-teams-overview.component.html',
  styleUrl: './roles-teams-overview.component.scss',
  animations: [
    trigger('detailExpand', [
      // maxHeight keeps height:auto on the wrapper so errors appearing after
      // expansion are not clipped by a frozen pixel height.
      state('collapsed', style({ maxHeight: '0px', opacity: 0 })),
      state('expanded', style({ maxHeight: '600px', opacity: 1 })),
      transition('collapsed => expanded', animate('240ms 40ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition('expanded => collapsed', animate('180ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class RolesTeamsOverviewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileService = inject(ProfileVerificationService);
  private readonly baseUrl = environment.api.url2;

  // Literal space (not \s) intentionally excludes \t, \n, \r from valid name characters.
  private static readonly NAME_PATTERN = /^[a-zA-Z .\-']+$/;

  private userId = '';
  private ulbCode = '';
  private localStateName = '';

  readonly displayedColumns = ['name', 'designation', 'contact'];

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly ulbInfo = signal<UlbBandInfo | null>(null);
  readonly contacts = signal<UlbContacts | null>(null);
  readonly municipalInfo = signal<RegisteredMunicipalInfo | null>(null);
  readonly editingContact = signal<ContactType | null>(null);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly contactRows = computed(() => {
    const c = this.contacts();
    if (!c) return [];
    // 'Conatact' typo in field names is from the API contract — do not rename here.
    return [
      this.mkRow('commissioner', 'Municipal Commissioner / Executive Officer',
        c.commissionerName ?? '', c.commissionerEmail ?? '', c.commissionerConatactNumber ?? ''),
      this.mkRow('accountant', 'ULB Nodal Officer',
        c.accountantName ?? '', c.accountantEmail ?? '', c.accountantConatactNumber ?? ''),
    ];
  });

  readonly municipalFields = computed(() => {
    const m = this.municipalInfo();
    if (!m) return [];
    return [
      { label: 'STATE', value: m.stateName, icon: 'map' },
      { label: 'ULB TYPE', value: m.ulbType, icon: 'account_balance' },
      { label: 'CENSUS CODE', value: m.censusCode, icon: 'fingerprint' },
      { label: 'ULB CODE', value: m.ulbCode, icon: 'badge' },
      { label: 'AREA', value: this.formatArea(m.area), icon: 'straighten' },
      { label: 'POPULATION (CENSUS 2011)', value: this.formatPopulation(m.population), icon: 'people' },
      { label: 'NO. OF WARDS', value: m.wards != null ? String(m.wards) : '', icon: 'grid_view' },
    ];
  });

  readonly editForm = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(RolesTeamsOverviewComponent.NAME_PATTERN),
        noHtmlOrScript,
        noMongoOperators,
      ],
    ],
    mobile: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/),
        noHtmlOrScript,
        noMongoOperators,
      ],
    ],
    email: [
      '',
      [
        Validators.email,
        Validators.maxLength(254),
        ...IDENTIFIER_SECURITY_VALIDATORS,
      ],
    ],
  });

  ngOnInit(): void {
    this.resolveFromStorage();
    this.loadData();
  }

  private resolveFromStorage(): void {
    const u = this.profileService.readStoredUser();
    this.userId = u._id ?? u.id ?? '';
    this.ulbCode = u.ulbCode ?? '';
    this.localStateName = u.stateName ?? '';
  }

  loadData(): void {
    if (!this.userId) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.http
      .get<{ success: boolean; data: ProfileContactsApiResponse } | ProfileContactsApiResponse>(
        `${this.baseUrl}users/${this.userId}/profile-contacts`,
      )
      .pipe(
        map((r) => ('success' in r ? r.data : r) as ProfileContactsApiResponse),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          if (!res) {
            this.hasError.set(true);
            this.isLoading.set(false);
            return;
          }

          this.contacts.set({
            commissionerName: res.commissionerName,
            commissionerEmail: res.commissionerEmail,
            commissionerConatactNumber: res.commissionerConatactNumber,
            accountantName: res.accountantName,
            accountantEmail: res.accountantEmail,
            accountantConatactNumber: res.accountantConatactNumber,
          });

          const d = res.ulbDetails;
          const entityName = d?.name ?? '';
          this.ulbInfo.set({
            name: entityName,
            code: d?.code ?? this.ulbCode,
            stateName: d?.stateName ?? this.localStateName,
            initials: this.getInitials(entityName || this.ulbCode),
          });

          this.municipalInfo.set(res.registeredMunicipalInfo ?? null);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  rowHasWarning(_index: number, row: { nameInvalid: boolean; mobileInvalid: boolean }): boolean {
    return row.nameInvalid || row.mobileInvalid;
  }

  toggleEdit(type: ContactType): void {
    if (this.editingContact() === type) {
      this.cancelEdit();
    } else {
      this.startEdit(type);
    }
  }

  startEdit(type: ContactType): void {
    const c = this.contacts();
    if (!c) return;

    const isComm = type === 'commissioner';
    this.editForm.reset({
      name:   isComm ? (c.commissionerName ?? '')          : (c.accountantName ?? ''),
      mobile: isComm ? (c.commissionerConatactNumber ?? '') : (c.accountantConatactNumber ?? ''),
      email:  isComm ? (c.commissionerEmail ?? '')          : (c.accountantEmail ?? ''),
    });
    this.saveError.set(null);
    this.editingContact.set(type);
    this.editForm.markAllAsTouched();
  }

  cancelEdit(): void {
    this.editingContact.set(null);
    this.saveError.set(null);
  }

  saveEdit(): void {
    // Guard must be first — prevents a second call racing through before isSaving signal updates the DOM.
    if (this.isSaving()) return;
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const type = this.editingContact();
    if (!type || !this.userId) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    const { name, mobile, email } = this.editForm.getRawValue();
    const isComm = type === 'commissioner';

    const payload = isComm
      ? { commissionerName: name, commissionerEmail: email, commissionerConatactNumber: mobile }
      : { accountantName: name, accountantEmail: email, accountantConatactNumber: mobile };

    this.http
      .patch(`${this.baseUrl}users/${this.userId}/profile-contacts`, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const cur = this.contacts()!;
          this.contacts.set(
            isComm
              ? { ...cur, commissionerName: name, commissionerEmail: email, commissionerConatactNumber: mobile }
              : { ...cur, accountantName: name, accountantEmail: email, accountantConatactNumber: mobile },
          );
          this.editingContact.set(null);
          this.isSaving.set(false);
          this.snackBar.open(
            `${isComm ? 'Commissioner' : 'Nodal Officer'} details updated.`,
            'Dismiss',
            { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
          );
        },
        error: (err: HttpErrorResponse) => {
          this.isSaving.set(false);
          this.saveError.set(err.error?.message ?? 'Failed to save. Please try again.');
        },
      });
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = cleaned;
    this.editForm.get('mobile')?.setValue(cleaned, { emitEvent: true });
  }

  formatArea(area: number | null): string {
    return area != null ? `${area.toLocaleString('en-IN')} Sq kms` : '—';
  }

  formatPopulation(pop: number | null): string {
    return pop != null ? pop.toLocaleString('en-IN') : '—';
  }

  getInitials(name: string): string {
    return name
      .trim()
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  private mkRow(type: ContactType, label: string, name: string, email: string, mobile: string) {
    return {
      type,
      label,
      name,
      email,
      mobile,
      nameInvalid: !!name && !RolesTeamsOverviewComponent.NAME_PATTERN.test(name),
      mobileInvalid: !!mobile && !/^[6-9]\d{9}$/.test(mobile),
    };
  }
}
