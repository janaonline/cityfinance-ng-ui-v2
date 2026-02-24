import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { logResponse } from './log-response';
import { AfsService } from '../afs.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ToStorageUrlPipe } from "../../../core/pipes/to-storage-url.pipe";
import { MatTabsModule } from '@angular/material/tabs';

export type SectionKey = 'ocr_extraction' | 'classification' | 'audit' | 'summary';
export type Decision = 'approved' | 'rejected' | null;

@Component({
  selector: 'app-afs-ar-approve-modal',
  imports: [MatDialogModule, MatButtonModule, NgClass, ReactiveFormsModule, FormsModule, MatIconModule, ToStorageUrlPipe, MatTabsModule],
  templateUrl: './afs-ar-approve-modal.component.html',
  styleUrl: './afs-ar-approve-modal.component.scss'
})
export class AfsArApproveModalComponent implements OnInit {
  activeTab: SectionKey = 'ocr_extraction';
  arData: any = null;

  isSubmiting = false;
  // p: any = null;

  sections: Record<SectionKey, { decision: Decision; notes: FormControl<string> }> = {
    ocr_extraction: { decision: null, notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }) },
    classification: { decision: null, notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }) },
    audit: { decision: null, notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }) },
    summary: { decision: null, notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }) },
  };

  constructor(
    private dialogRef: MatDialogRef<AfsArApproveModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; payload: any, id: string, type: string },
    private afsService: AfsService,
  ) { }

  // get p() {
  //   return logResponse['ulbFile'].data;
  //   // return this.data?.payload ?? {}; 
  // }

  ngOnInit() {
    this.getItems();
  }

  getItems() {
    // if (section === 'classification') return this.p?.classification?.evidence || [];
    // if (section === 'audit') return this.p?.audit?.extraction?.evidence_quotes || [];
    // if (section === 'summary') return this.p?.summary?.data?.evidence_quotes || [];
    // return [];

    this.afsService.getARItems({ id: this.data.id }).subscribe(res => {
      console.log('AR items:', res, this.data.type);
      const fileType = this.data.type === 'ULB' ? 'ulbFile' : 'afsFile';
      this.arData = res.data[fileType]?.data;
      // this.p = this.arData;
      // this.sections.classification = {
      //   ...this.sections.classification,
      //   decision: this.arData?.classification?.decision,
      //   notes: this.arData?.classification?.decisionNote
      // };
      this.sections.classification.notes.setValue(this.arData?.classification?.decisionNote || '');
      this.sections.classification.decision = this.arData?.classification?.decision;
      this.sections.audit.decision = this.arData?.audit?.decision;
      this.sections.audit.notes.setValue(this.arData?.audit?.decisionNote || '');
      this.sections.summary.decision = this.arData?.summary?.decision || null;
      this.sections.summary.notes.setValue(this.arData?.summary?.decisionNote || '');
      this.sections.ocr_extraction.decision = this.arData?.ocr_extraction?.decision;
      this.sections.ocr_extraction.notes.setValue(this.arData?.ocr_extraction?.decisionNote || '');

    });
  }

  setDecision(section: SectionKey, decision: Exclude<Decision, null>) {
    const payload = {
      id: this.data.id,
      type: this.data.type,
      section,
      decision, // Convert to lowercase if API expects that
      notes: this.sections[section].notes.value
    };
    // console.log('Decision updated:', payload);
    this.isSubmiting = true;
    this.afsService.submitARDecision(payload).subscribe(res => {
      this.isSubmiting = false;
      console.log('Decision submitted:', res);
      this.sections[section].decision = decision;
    });
  }

  badgeClass(d: Decision) {
    if (d === 'approved') return 'bg-success';
    if (d === 'rejected') return 'bg-danger';
    return 'bg-secondary';
  }

  label(d: Decision) { return d ?? 'PENDING'; }

  get allDecided(): boolean {
    return (Object.keys(this.sections) as SectionKey[]).every(k => !!this.sections[k].decision);
  }

  submit() {
    this.dialogRef.close({
      reviewedAt: new Date().toISOString(),
      sectionReviews: {
        classification: { decision: this.sections.classification.decision, notes: this.sections.classification.notes.value },
        audit: { decision: this.sections.audit.decision, notes: this.sections.audit.notes.value },
        summary: { decision: this.sections.summary.decision, notes: this.sections.summary.notes.value },
      }
    });
  }

  cancel() { this.dialogRef.close(null); }
}
