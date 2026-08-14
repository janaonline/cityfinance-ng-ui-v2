export interface BudgetDocumentFile {
  name: string;
  url: string | null;
  uploadedAt: string;
}

export interface BudgetDocumentResponse {
  designYearId: string;
  designYear: string;
  file: BudgetDocumentFile | null;
}

export interface UploadBudgetDocumentPayload {
  designYearId: string;
  originalName: string;
  sizeKb: number;
  s3Key: string;
}
