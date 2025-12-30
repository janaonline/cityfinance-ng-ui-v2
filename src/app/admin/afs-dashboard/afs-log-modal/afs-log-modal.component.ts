import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AfsService } from '../afs.service';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';

export interface DialogData {
  requestId: string;
}

export interface LogData {
  DigitizedExcelUrl: string;
  ErrorCode: string;
  ErrorMessage: string;
  ErrorResolution: string;
  ExcelGeneration_ProcessingTimeMs: number;
  ExcelGeneration_Status: string;
  ExcelGeneration_StatusCode: number;
  ExcelStorage_ProcessingTimeMs: number;
  ExcelStorage_Status: string;
  ExcelStorage_StatusCode: number;
  FinalStatusCode: number;
  IPAddress: string;
  LLM_ConfidenceScoring_ProcessingTimeMs: number;
  LLM_ConfidenceScoring_Status: string;
  LLM_ConfidenceScoring_StatusCode: number;
  LLM_Postprocessing_ProcessingTimeMs: number;
  LLM_Postprocessing_Status: string;
  LLM_Postprocessing_StatusCode: number;
  LLM_Validation_ProcessingTimeMs: number;
  LLM_Validation_Status: string;
  LLM_Validation_StatusCode: number;
  Message: string;
  OCR_ProcessingTimeMs: number;
  OCR_Status: string;
  OCR_StatusCode: number;
  OriginalErrorMessage: string;
  PDFEnhancement_ProcessingTimeMs: number;
  PDFEnhancement_Status: string;
  PDFEnhancement_StatusCode: number;
  PDFQualityCheck_BlurScore: number;
  PDFQualityCheck_ProcessingTimeMs: number;
  PDFQualityCheck_Status: string;
  PDFQualityCheck_StatusCode: number;
  PDFUpload_FileName: string;
  PDFUpload_FileSize_In_Bytes: number;
  PDFUpload_FileType: string;
  PDFUpload_Status: string;
  PDFUpload_StatusCode: number;
  ProcessingMode: string;
  RequestId: string;
  RetryCount: number;
  S3Upload_ProcessingTimeMs: number;
  S3Upload_Status: string;
  S3Upload_StatusCode: number;
  SourcePDFUrl: string;
  Timestamp: string;
  TotalProcessingTimeMs: number;
  _id: string;
}

@Component({
  selector: 'app-afs-log-modal',
  imports: [MatDialogModule, MatButtonModule, NgClass, DatePipe, DecimalPipe],
  templateUrl: './afs-log-modal.component.html',
  styleUrl: './afs-log-modal.component.scss'
})
export class AfsLogModalComponent implements OnInit {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly afsService = inject(AfsService);

  logsData!: LogData;

  // constructor() {
  //   console.log('Request ID in dialog:', this.data);
  // }

  ngOnInit(): void {
    this.fetchLog();
  }

  fetchLog() {
    this.afsService.getRequestLog(this.data.requestId).subscribe((response) => {
      this.logsData = response.data;
    });
  }

}
