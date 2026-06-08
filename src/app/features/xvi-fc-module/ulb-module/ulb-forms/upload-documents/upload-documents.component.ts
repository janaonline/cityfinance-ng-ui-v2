import { Component, OnDestroy, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { Location, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface UploadDocumentDef {
  id: string;
  title: string;
  subtitle: string;
}

export interface UploadPageConfig {
  type: 'audited' | 'provisional';
  description: string;
  confirmLabel: string;
  documents: ReadonlyArray<UploadDocumentDef>;
}

export const UPLOAD_CONFIGS: Record<'audited' | 'provisional', UploadPageConfig> = {
  audited: {
    type: 'audited',
    description:
      'Upload your audited financial statement for FY 2024-25. You may upload documents in any order. The system will automatically verify that each document is readable and meets the required checks.',
    confirmLabel: 'Confirm Audited Documents',
    documents: [
      { id: 'receipts-payments', title: 'Receipts and Payments Statement', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'balance-sheet', title: 'Balance Sheet', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'balance-sheet-schedules', title: 'Balance Sheet Schedules', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'income-expenditure', title: 'Income and Expenditure Statement', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'income-statement-schedules', title: 'Income Statement Schedules', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'cash-flow', title: 'Cash Flow Statement', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'auditors-report', title: "Auditor's Report", subtitle: 'PDF only · CA-certified' },
    ],
  },
  provisional: {
    type: 'provisional',
    description:
      'Upload your provisional financial statement for FY 2025-26. You may upload documents in any order. The system will automatically verify that each document is readable and meets the required checks.',
    confirmLabel: 'Confirm Provisional Documents',
    documents: [
      { id: 'receipts-payments', title: 'Receipts and Payments Statement', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'balance-sheet', title: 'Balance Sheet', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'balance-sheet-schedules', title: 'Balance Sheet Schedules', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'income-expenditure', title: 'Income and Expenditure Statement', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'income-statement-schedules', title: 'Income Statement Schedules', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'cash-flow', title: 'Cash Flow Statement', subtitle: 'FY 2025-26 · PDF only' },
    ],
  },
};

type DocumentStatus = 'pending' | 'uploaded';

interface UploadDocument extends UploadDocumentDef {
  status: DocumentStatus;
  fileName: string | null;
  previewUrl: string | null;
}

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
}

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [NgClass, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './upload-documents.component.html',
  styleUrl: './upload-documents.component.scss',
})
export class UploadDocumentsComponent implements OnDestroy {
  private readonly location = inject(Location);

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingDocId: string | null = null;

  readonly config: UploadPageConfig =
    inject(ActivatedRoute).snapshot.data['config'] as UploadPageConfig;

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());

  readonly documents = signal<UploadDocument[]>(
    this.config.documents.map((d) => ({ ...d, status: 'pending', fileName: null, previewUrl: null })),
  );

  readonly readyCount = computed(() => this.documents().filter((d) => d.status === 'uploaded').length);
  readonly totalCount = this.config.documents.length;
  readonly progressPct = computed(() => Math.round((this.readyCount() / this.totalCount) * 100));
  readonly allReady = computed(() => this.readyCount() === this.totalCount);

  ngOnDestroy(): void {
    this.documents().forEach((d) => {
      if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
    });
  }

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
    const previewUrl = URL.createObjectURL(file);

    this.documents.update((docs) =>
      docs.map((d) => {
        if (d.id !== docId) return d;
        if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
        return { ...d, status: 'uploaded', fileName: file.name, previewUrl };
      }),
    );
    this.pendingDocId = null;
  }

  previewFile(url: string): void {
    window.open(url, '_blank', 'noopener');
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
