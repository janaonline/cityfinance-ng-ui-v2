import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FcUnspentDeclarationService } from '../../fc-unspent-declaration.service';
import { FcUnspentUlbOption } from '../../fc-unspent-declaration.models';

export interface UlbPickerDialogData {
  stateId: string;
  yearId: string;
  /** ulbIds already selected by other rows in the current session — disabled in the results list. */
  excludeUlbIds: string[];
}

const ULB_PICKER_PAGE_SIZE = 20;

/**
 * Self-contained, backend-searched/paginated ULB picker. Calls `FcUnspentDeclarationService.getUlbOptions`
 * itself — never receives a pre-fetched options array — so opening/closing this dialog is the only place
 * that ever fetches a page of ULB options; no page is retained once the dialog closes.
 */
@Component({
  selector: 'app-ulb-picker-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './ulb-picker-dialog.component.html',
  styleUrl: './ulb-picker-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UlbPickerDialogComponent implements OnInit {
  private readonly service = inject(FcUnspentDeclarationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption | undefined>);
  readonly data = inject<UlbPickerDialogData>(MAT_DIALOG_DATA);

  readonly search = new FormControl('', { nonNullable: true });

  readonly options = signal<readonly FcUnspentUlbOption[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = ULB_PICKER_PAGE_SIZE;
  readonly isLoading = signal(false);
  readonly loadError = signal(false);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  private readonly excludeSet = computed(() => new Set(this.data.excludeUlbIds));

  /** Monotonically increasing request id — guards against a stale page/search response landing
   *  after a newer one has already been requested. */
  private loadRequestId = 0;

  ngOnInit(): void {
    this.loadOptions();

    this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.loadOptions();
      });
  }

  loadOptions(): void {
    const requestId = ++this.loadRequestId;
    this.isLoading.set(true);
    this.loadError.set(false);

    this.service
      .getUlbOptions(this.data.stateId, this.data.yearId, {
        search: this.search.value.trim() || undefined,
        page: this.page(),
        limit: this.limit,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (requestId !== this.loadRequestId) return;
          this.options.set(result.options);
          this.total.set(result.total);
          this.isLoading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) return;
          this.loadError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadOptions();
  }

  isExcluded(ulbId: string): boolean {
    return this.excludeSet().has(ulbId);
  }

  select(option: FcUnspentUlbOption): void {
    if (this.isExcluded(option.ulbId)) return;
    this.dialogRef.close(option);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
