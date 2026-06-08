import { Component, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
}

type PeriodForm = FormGroup<{
  balance: FormControl<string | null>;
  accountNumber: FormControl<string | null>;
}>;

interface FcPeriod {
  key: string;
  label: string;
  disclosureOnly: boolean;
  form: PeriodForm;
}

function createPeriodForm(): PeriodForm {
  return new FormGroup({
    balance: new FormControl('', [Validators.required]),
    accountNumber: new FormControl('', [Validators.required]),
  });
}

@Component({
  selector: 'app-fill-disclosure',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule],
  templateUrl: './fill-disclosure.component.html',
  styleUrl: './fill-disclosure.component.scss',
})
export class FillDisclosureComponent {
  private readonly location = inject(Location);

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingFileKey: string | null = null;

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly activeMode = signal<'manual' | 'document-assisted'>('manual');

  readonly files = signal<Record<string, File | null>>({
    'support-14': null,
    'support-15': null,
    'doc-14': null,
    'doc-15': null,
  });

  readonly periods: FcPeriod[] = [
    { key: '14', label: '14th Finance Commission', disclosureOnly: false, form: createPeriodForm() },
    { key: '15', label: '15th Finance Commission', disclosureOnly: true, form: createPeriodForm() },
  ];

  private readonly allFormsValid = toSignal(
    merge(...this.periods.map((p) => p.form.statusChanges)).pipe(
      map(() => this.periods.every((p) => p.form.valid)),
    ),
    { initialValue: false },
  );

  readonly canSave = computed(() => {
    const mode = this.activeMode();
    const f = this.files();
    if (!this.allFormsValid()) return false;
    if (mode === 'manual') return !!f['support-14'] && !!f['support-15'];
    return !!f['doc-14'] && !!f['doc-15'];
  });

  readonly infoBannerText = computed(() =>
    this.activeMode() === 'manual'
      ? 'Enter each balance manually and upload the supporting bank document as evidence. All fields are required.'
      : 'Upload your bank document first. The system will attempt to extract the balance amount and account number automatically. Review the extracted values carefully before saving — extracted values are not treated as final until you confirm them.',
  );

  setMode(mode: 'manual' | 'document-assisted'): void {
    this.activeMode.set(mode);
  }

  triggerFile(key: string): void {
    this.pendingFileKey = key;
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.pendingFileKey) return;
    const key = this.pendingFileKey;
    this.files.update((f) => ({ ...f, [key]: file }));
    this.pendingFileKey = null;
  }

  saveDisclosure(): void {
    if (!this.canSave()) return;
    // TODO: wire to submission API
  }

  goBack(): void {
    this.location.back();
  }

  private loadUlbDetails(): UlbDetails | null {
    try {
      const raw = localStorage.getItem('xvifc_ulb_details');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UlbDetails>;
      if (!parsed.ulbName || !parsed.stateName || !parsed.selectedYear) return null;
      return { ulbName: parsed.ulbName, stateName: parsed.stateName, selectedYear: parsed.selectedYear };
    } catch {
      return null;
    }
  }
}
