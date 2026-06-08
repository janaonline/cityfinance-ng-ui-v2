import { Component, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { Location, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

type DocumentStatus = 'pending' | 'uploaded';

interface UploadDocument {
  id: string;
  title: string;
  subtitle: string;
  status: DocumentStatus;
  fileName: string | null;
}

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
}

const DOCUMENT_DEFS: ReadonlyArray<Pick<UploadDocument, 'id' | 'title' | 'subtitle'>> = [
  { id: 'receipts-payments', title: 'Receipts and Payments Statement', subtitle: 'FY 2024-25 · PDF only' },
  { id: 'balance-sheet', title: 'Balance Sheet', subtitle: 'FY 2024-25 · PDF only' },
  { id: 'balance-sheet-schedules', title: 'Balance Sheet Schedules', subtitle: 'FY 2024-25 · PDF only' },
  { id: 'income-expenditure', title: 'Income and Expenditure Statement', subtitle: 'FY 2024-25 · PDF only' },
  { id: 'income-statement-schedules', title: 'Income Statement Schedules', subtitle: 'FY 2024-25 · PDF only' },
  { id: 'cash-flow', title: 'Cash Flow Statement', subtitle: 'FY 2024-25 · PDF only' },
  { id: 'auditors-report', title: "Auditor's Report", subtitle: 'PDF only · CA-certified' },
];

@Component({
  selector: 'app-upload-audited',
  standalone: true,
  imports: [NgClass, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './upload-audited.component.html',
  styleUrl: './upload-audited.component.scss',
})
export class UploadAuditedComponent {
  private readonly location = inject(Location);

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingDocId: string | null = null;

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());

  readonly documents = signal<UploadDocument[]>(
    DOCUMENT_DEFS.map((d) => ({ ...d, status: 'pending', fileName: null })),
  );

  readonly readyCount = computed(() => this.documents().filter((d) => d.status === 'uploaded').length);
  readonly totalCount = DOCUMENT_DEFS.length;
  readonly progressPct = computed(() => Math.round((this.readyCount() / this.totalCount) * 100));
  readonly allReady = computed(() => this.readyCount() === this.totalCount);

  goBack(): void {
    this.location.back();
  }

  triggerUpload(docId: string): void {
    this.pendingDocId = docId;
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.pendingDocId) return;

    const docId = this.pendingDocId;
    this.documents.update((docs) =>
      docs.map((d) => (d.id === docId ? { ...d, status: 'uploaded', fileName: file.name } : d)),
    );
    this.pendingDocId = null;
  }

  confirmDocuments(): void {
    // TODO: wire to submission API
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
