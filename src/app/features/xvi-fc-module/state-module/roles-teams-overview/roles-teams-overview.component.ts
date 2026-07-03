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
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LowerCasePipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileVerificationService } from '../../shared/profile-verification/profile-verification.service';
import { PageErrorStateComponent } from '../../shared/page-error-state/page-error-state.component';
import {
  IDENTIFIER_SECURITY_VALIDATORS,
  noHtmlOrScript,
  noMongoOperators,
} from '../../../../auth/validators/auth-security.validators';

export type StateSubRole = 'SUBMITTER' | 'EDITOR' | 'VIEWER';

export const SUBROLE_LABEL: Record<StateSubRole, string> = {
  SUBMITTER: 'Admin',
  EDITOR: 'Reviewer',
  VIEWER: 'Viewer',
};

export interface StateMember {
  _id: string;
  name: string;
  mobile: string;
  designation: string;
  subRole: StateSubRole;
  isActive: boolean;
  isXVIFCProfileVerified: boolean;
  lastActive: string | null;
  email?: string;
}

interface PermissionRow {
  label: string;
  admin: boolean;
  reviewer: boolean;
  viewer: boolean;
}

interface ActionButton {
  label: string;
  iconClass: string;
  variant: 'stroked' | 'flat';
  color?: string;
  tooltip: string;
  isActive: boolean;
  showChevron: boolean;
  disabled: boolean;
  onClick: () => void;
}

type CellType = 'member' | 'designation' | 'role' | 'status' | 'lastActive' | 'actions';

interface TableColumn {
  key: string;
  header: string;
  thClass: string;
  tdClass: string;
  cellType: CellType;
}

interface FormFieldConfig {
  controlName: string;
  label: string;
  placeholder: string;
  iconClass: string;
  type: 'text' | 'email' | 'tel' | 'select';
  autocomplete: string;
  maxlength?: number;
  inputmode?: string;
  options?: { value: string; label: string }[];
  onInput?: (e: Event) => void;
  errors: { key: string; message: string }[];
}

// Literal space — intentionally excludes \t, \n, \r from valid name characters.
const NAME_PATTERN = /^[a-zA-Z .\-']+$/;



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
    MatDividerModule,
    MatTableModule,
    MatSelectModule,
    MatTooltipModule,
    LowerCasePipe,
    PageErrorStateComponent,
  ],
  templateUrl: './roles-teams-overview.component.html',
  styleUrl: './roles-teams-overview.component.scss',
  animations: [
    trigger('panelSlide', [
      state('void', style({ maxHeight: '0px', opacity: 0, overflow: 'hidden' })),
      state('*',    style({ maxHeight: '900px', opacity: 1, overflow: 'hidden' })),
      transition(':enter', animate('220ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition(':leave', animate('160ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class RolesTeamsOverviewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileService = inject(ProfileVerificationService);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.api.url2;

  readonly permissionMatrix = signal<PermissionRow[]>([]);

  readonly tableColumns: TableColumn[] = [
    { key: 'member',      header: 'Name, Phone & Email', thClass: '',                       tdClass: '',                       cellType: 'member' },
    { key: 'designation', header: 'Designation',  thClass: 'd-none d-md-table-cell', tdClass: 'd-none d-md-table-cell', cellType: 'designation' },
    { key: 'role',        header: 'Role',          thClass: '',                       tdClass: '',                       cellType: 'role' },
    { key: 'status',      header: 'Status',        thClass: 'd-none d-lg-table-cell', tdClass: 'd-none d-lg-table-cell', cellType: 'status' },
    { key: 'lastActive',  header: 'Last Active',   thClass: 'd-none d-xl-table-cell', tdClass: 'd-none d-xl-table-cell', cellType: 'lastActive' },
    { key: 'actions',     header: '',              thClass: 'text-end pe-3',          tdClass: 'text-end pe-3',          cellType: 'actions' },
  ];

  readonly displayedColumns = this.tableColumns.map(c => c.key);

  readonly addFormFields: FormFieldConfig[] = [
    {
      controlName: 'name',
      label: 'Full Name',
      placeholder: 'e.g. Anjali Sharma',
      iconClass: 'bi bi-person',
      type: 'text',
      autocomplete: 'name',
      maxlength: 100,
      onInput: (e: Event) => this.onNameInput(e),
      errors: [
        { key: 'required',    message: 'Full name is required.' },
        { key: 'minlength',   message: 'Name must be at least 2 characters.' },
        { key: 'pattern',     message: 'Numbers and special characters are not allowed in name.' },
        { key: 'unsafeInput', message: 'Name contains disallowed characters.' },
      ],
    },
    {
      controlName: 'designation',
      label: 'Designation',
      placeholder: 'e.g. Deputy Director',
      iconClass: 'bi bi-person-badge',
      type: 'text',
      autocomplete: 'organization-title',
      maxlength: 100,
      onInput: (e: Event) => this.onDesignationInput(e),
      errors: [
        { key: 'required',    message: 'Designation is required.' },
        { key: 'minlength',   message: 'Must be at least 2 characters.' },
        { key: 'pattern',     message: 'Numbers and special characters are not allowed in designation.' },
        { key: 'unsafeInput', message: 'Contains disallowed characters.' },
      ],
    },
    {
      controlName: 'subRole',
      label: 'Assign Role',
      placeholder: '',
      iconClass: 'bi bi-person-gear',
      type: 'select',
      autocomplete: '',
      options: [
        { value: 'EDITOR', label: 'Reviewer' },
        { value: 'VIEWER', label: 'Viewer' },
      ],
      errors: [
        { key: 'required', message: 'Role is required.' },
      ],
    },
    {
      controlName: 'email',
      label: 'Email Address',
      placeholder: 'official@state.gov.in',
      iconClass: 'bi bi-envelope',
      type: 'email',
      autocomplete: 'email',
      errors: [
        { key: 'required',    message: 'Email address is required.' },
        { key: 'email',       message: 'Enter a valid email — e.g. name@domain.com.' },
        { key: 'maxlength',   message: 'Email must not exceed 254 characters.' },
        { key: 'unsafeInput', message: 'Email contains disallowed characters.' },
      ],
    },
    {
      controlName: 'mobile',
      label: 'Mobile Number',
      placeholder: '10-digit number',
      iconClass: 'bi bi-telephone',
      type: 'tel',
      autocomplete: 'tel',
      maxlength: 10,
      inputmode: 'numeric',
      onInput: (e: Event) => this.onMobileInput(e),
      errors: [
        { key: 'required',    message: 'Mobile number is required.' },
        { key: 'pattern',     message: 'Must be 10 digits, starting with 6, 7, 8, or 9. Letters and special characters are not allowed.' },
        { key: 'unsafeInput', message: 'Mobile contains disallowed characters.' },
      ],
    },
  ];

  readonly infoBannerText =
    'Staff whose details are on record from the 15th Finance Commission can sign in directly ' +
    'using their registered email ID and password. To give access to someone new, use ' +
    '<strong>Add Member</strong> below — they will receive an email invitation to set up their login.';

  private currentUserId = '';
  private stateId = '';

  // Signals
  readonly currentSubRole = signal<StateSubRole>('VIEWER');
  readonly currentUserName = signal<string>('');

  getRoleLabel(subRole: string): string {
    return SUBROLE_LABEL[subRole as StateSubRole] ?? subRole;
  }
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly members = signal<StateMember[]>([]);

  // Panel visibility
  readonly showPermissionMatrix = signal(false);
  readonly showAddMember = signal(false);
  readonly isAdding = signal(false);
  readonly addError    = signal<string | null>(null);
  readonly addConflict = signal<{ name: string; designation: string } | null>(null);

  // Per-row action states
  readonly roleChangingId   = signal<string | null>(null);
  readonly editingRoleId    = signal<string | null>(null);
  readonly deletingId       = signal<string | null>(null);
  readonly confirmDeleteId  = signal<string | null>(null);

  // Transfer ownership
  readonly showTransferPanel = signal(false);
  readonly isTransferring = signal(false);
  readonly transferError = signal<string | null>(null);
  readonly transferTargetId = signal<string>('');

  readonly isSubmitter = computed(() => this.currentSubRole() === 'SUBMITTER');

  readonly eligibleTransferTargets = computed(() =>
    this.members().filter(m =>
      m._id !== this.currentUserId &&
      m.isActive &&
      m.isXVIFCProfileVerified &&
      m.subRole !== 'SUBMITTER',
    )
  );

  readonly selectedTransferTarget = computed(() =>
    this.eligibleTransferTargets().find(m => m._id === this.transferTargetId()) ?? null
  );

  readonly actionButtons = computed<ActionButton[]>(() => [
    {
      label: 'Permission matrix',
      iconClass: 'bi bi-shield-fill-check me-1',
      variant: 'stroked',
      tooltip: 'Click to see permission matrix',
      isActive: this.showPermissionMatrix(),
      showChevron: true,
      disabled: false,
      onClick: () => this.togglePermissionMatrix(),
    },
    {
      label: 'Add Member',
      iconClass: 'bi bi-plus-lg me-1',
      variant: 'flat',
      color: 'primary',
      tooltip: this.isSubmitter()
        ? 'Click to add a new team member'
        : 'Only the Admin can add new members',
      isActive: false,
      showChevron: false,
      disabled: !this.isSubmitter(),
      onClick: () => this.openAddMember(),
    },
  ]);

  readonly addForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(NAME_PATTERN),
      noHtmlOrScript,
      noMongoOperators,
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254),
      ...IDENTIFIER_SECURITY_VALIDATORS,
    ]],
    mobile: ['', [
      Validators.required,
      Validators.pattern(/^[6-9]\d{9}$/),
      noHtmlOrScript,
      noMongoOperators,
    ]],
    designation: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(/^[a-zA-Z .\-]+$/),
      noHtmlOrScript,
      noMongoOperators,
    ]],
    subRole: [('EDITOR' as StateSubRole), Validators.required],
  });

  ngOnInit(): void {
    const u = this.profileService.readStoredUser();
    this.currentUserId = u._id ?? u.id ?? '';
    this.stateId = String(u['state'] ?? '');
    this.currentSubRole.set((u['subRole'] as StateSubRole | undefined) ?? 'SUBMITTER');
    this.currentUserName.set(String(u['name'] ?? ''));
    this.loadMembers();
    this.loadPermissionMatrix();
  }

  private loadPermissionMatrix(): void {
    this.http
      .get<{ success: boolean; data: PermissionRow[] } | PermissionRow[]>(
        `${this.baseUrl}users/permission-matrix`,
      )
      .pipe(
        map((r): PermissionRow[] =>
          'success' in r && Array.isArray((r as { data: unknown }).data)
            ? (r as { success: boolean; data: PermissionRow[] }).data
            : (r as PermissionRow[]),
        ),
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((rows) => this.permissionMatrix.set(rows));
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.http
      .get<{ success: boolean; data: StateMember[] } | StateMember[]>(
        `${this.baseUrl}users/state-members`,
      )
      .pipe(
        // Dev server returns raw array; local NestJS ResponseTransformInterceptor wraps { success, data }
        map((r): StateMember[] =>
          'success' in r && Array.isArray((r as { data: unknown }).data)
            ? (r as { success: boolean; data: StateMember[] }).data
            : (r as StateMember[]),
        ),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (members) => {
          if (!members) {
            this.hasError.set(true);
          } else {
            this.members.set(members);
            // Derive role from fresh API data — localStorage subRole can be stale
            const me = members.find(m => m._id === this.currentUserId);
            if (me) this.currentSubRole.set(me.subRole);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  togglePermissionMatrix(): void {
    const opening = !this.showPermissionMatrix();
    if (opening) {
      this.cancelAddMember();
    }
    this.showPermissionMatrix.set(opening);
  }

  openAddMember(): void {
    this.showPermissionMatrix.set(false);
    this.addForm.reset({ subRole: 'EDITOR' });
    this.addError.set(null);
    this.addConflict.set(null);
    this.showAddMember.set(true);
  }

  cancelAddMember(): void {
    this.showAddMember.set(false);
    this.addForm.reset({ subRole: 'EDITOR' });
    this.addError.set(null);
    this.addConflict.set(null);
  }

  backToForm(): void {
    this.addConflict.set(null);
    this.addError.set(null);
  }

  submitAddMember(): void {
    if (this.isAdding()) return;
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    this.submitInvite('invite');
  }

  restoreMember(): void  { this.submitInvite('restore'); }
  createFreshMember(): void { this.submitInvite('force-new'); }

  private submitInvite(action: 'invite' | 'restore' | 'force-new'): void {
    this.isAdding.set(true);
    this.addError.set(null);
    this.addConflict.set(null);

    const payload = { ...this.addForm.getRawValue(), action };

    this.http
      .post<unknown>(`${this.baseUrl}users/invite-state-member`, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isAdding.set(false);
          this.cancelAddMember();
          this.loadMembers();
          this.snackBar.open(`${payload.name} has been invited successfully.`, 'Dismiss',
            { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] });
        },
        error: (err: HttpErrorResponse) => {
          this.isAdding.set(false);
          const body: Record<string, unknown> = err.error ?? {};
          if (body['code'] === 'EMAIL_PREVIOUSLY_REGISTERED') {
            const deleted = body['deletedUser'] as { name: string; designation: string } | undefined;
            this.addConflict.set({ name: deleted?.name ?? '', designation: deleted?.designation ?? '' });
          } else {
            this.addError.set((body['message'] as string) ?? 'Failed to invite member. Please try again.');
          }
        },
      });
  }

  onRoleSelectClose(opened: boolean, rowId: string): void {
    if (!opened && this.roleChangingId() === null) {
      this.editingRoleId.set(null);
    }
  }

  changeRole(member: StateMember, newRole: StateSubRole): void {
    if (newRole === member.subRole || this.roleChangingId()) return;

    this.editingRoleId.set(null);
    const previousRole = member.subRole;
    this.roleChangingId.set(member._id);
    // Optimistic update — revert on failure
    this.members.update(list => list.map(m => m._id === member._id ? { ...m, subRole: newRole } : m));

    this.http
      .patch(`${this.baseUrl}users/${member._id}/sub-role`, { subRole: newRole })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.roleChangingId.set(null);
          this.loadMembers();
          this.snackBar.open(`${member.name}'s role updated to ${SUBROLE_LABEL[newRole]}.`, 'Dismiss',
            { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] });
        },
        error: (err: HttpErrorResponse) => {
          this.members.update(list => list.map(m => m._id === member._id ? { ...m, subRole: previousRole } : m));
          this.roleChangingId.set(null);
          this.snackBar.open(err.error?.message ?? 'Role update failed. Please try again.', 'Dismiss',
            { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-error'] });
        },
      });
  }

  requestDelete(memberId: string): void {
    this.confirmDeleteId.set(memberId);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(member: StateMember): void {
    if (this.deletingId()) return;
    this.deletingId.set(member._id);
    this.confirmDeleteId.set(null);

    this.http
      .delete(`${this.baseUrl}users/${member._id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.members.update(list => list.filter(m => m._id !== member._id));
          this.deletingId.set(null);
          this.snackBar.open(
            `${member.name} has been removed from the team.`,
            'Dismiss',
            { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
          );
        },
        error: (err: HttpErrorResponse) => {
          this.deletingId.set(null);
          this.snackBar.open(err.error?.message ?? 'Failed to remove member. Please try again.', 'Dismiss',
            { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-error'] });
        },
      });
  }

  openTransferPanel(): void {
    this.transferTargetId.set('');
    this.transferError.set(null);
    this.showTransferPanel.set(true);
  }

  cancelTransfer(): void {
    this.showTransferPanel.set(false);
    this.transferError.set(null);
  }

  confirmTransfer(): void {
    if (this.isTransferring()) return;
    const toUserId = this.transferTargetId();
    if (!toUserId) {
      this.transferError.set('Please select a team member to transfer ownership to.');
      return;
    }

    this.isTransferring.set(true);
    this.transferError.set(null);

    this.http
      .post(`${this.baseUrl}users/transfer-submitter`, { toUserId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.currentSubRole.set('EDITOR');
          this.isTransferring.set(false);
          this.showTransferPanel.set(false);
          this.loadMembers();
          this.authService.refreshAccessToken().pipe(
            takeUntilDestroyed(this.destroyRef),
          ).subscribe();
          this.snackBar.open('Ownership transferred. Your role is now Reviewer.', 'Dismiss',
            { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] });
        },
        error: (err: HttpErrorResponse) => {
          this.isTransferring.set(false);
          this.transferError.set(err.error?.message ?? 'Transfer failed. Please try again.');
        },
      });
  }

  isCurrentUser(memberId: string): boolean {
    return memberId === this.currentUserId;
  }

  canDelete(member: StateMember): boolean {
    return this.isSubmitter() && !this.isCurrentUser(member._id) && member.subRole !== 'SUBMITTER';
  }

  onDesignationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-Z .\-]/g, '');
    input.value = cleaned;
    this.addForm.get('designation')?.setValue(cleaned, { emitEvent: true });
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Strip digits and anything not in the allowed set in real time
    const cleaned = input.value.replace(/[^a-zA-Z .\-']/g, '');
    input.value = cleaned;
    this.addForm.get('name')?.setValue(cleaned, { emitEvent: true });
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Strip all non-digits in real time; cap at 10 characters
    const cleaned = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = cleaned;
    this.addForm.get('mobile')?.setValue(cleaned, { emitEvent: true });
  }

  getFirstError(controlName: string, errors: { key: string; message: string }[]): string | null {
    const ctrl = this.addForm.get(controlName);
    if (!ctrl?.touched) return null;
    return errors.find(e => ctrl.hasError(e.key))?.message ?? null;
  }

  formatLastActive(date: string | null): string {
    if (!date) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(date));
    } catch { return '—'; }
  }

  getInitials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  trackByMemberId(_: number, m: StateMember): string { return m._id; }
}
