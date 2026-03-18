export interface OcrEngineEvidence {
    doc_type_snippets: string[];
    fy_snippets: string[];
    ulb_snippets: string[];
}

export interface OcrEngineConfidence {
    doc_type: number | null;
    fy: number | null;
    ulb: number | null;
}

export interface OcrEngineAnalysis {
    doc_type: string | null;
    fy: string | null;
    as_on_date: string | null;
    ulb_name: string | null;
    evidence: OcrEngineEvidence;
    confidence: OcrEngineConfidence;
    issues: string[];
}

export interface OcrEngineTiming {
    ocr_duration_seconds?: number;
    validation_duration_seconds?: number;
    excel_duration_seconds?: number;
}

export interface OcrEngineResult {
    status: string;
    result: OcrEngineAnalysis;
    page_count: number | null;
    ocr_s3_key?: string | null;
    ocr_url?: string | null;
    excel_s3_key?: string | null;
    excel_url?: string | null;
    textract_job_id?: string | null;
    textract_job_type?: string | null;
    textract_input_key?: string | null;
    timing?: OcrEngineTiming;
}

export interface OcrAgreement {
    doc_type_match: boolean;
    fy_match: boolean;
    ulb_name_match: boolean;
}

export interface OcrPdfQualityReport {
    status: string;
    blur_scores: number[];
    average_blur_score: number;
    min_blur_score: number;
    threshold: number;
    issues: string[];
    pages_checked: number[];
    total_pages: number;
}

export interface OcrPdfQuality {
    checked: boolean;
    enhancement_applied: boolean;
    report: OcrPdfQualityReport;
}

export interface OcrResponseTiming {
    total_duration_seconds: number;
}

export interface FailedOcrResponse {
    detail: string;
}

export interface OcrResponse {
    job_id: string;
    s3_key: string | null;
    textract_job_id: string | null;
    status: string;
    error: string | null;
    ocr_text: string | null;
    extracted: unknown | null;
    verification: unknown | null;
    pdf_s3_key: string | null;
    docx_s3_key: string | null;
    presigned_url: string | null;
    filename: string;
    created_at: string;
    updated_at: string;
    agreement: OcrAgreement;
    engines: Record<string, OcrEngineResult>;
    errors: Record<string, unknown>;
    ocr_method: string;
    pdf_quality: OcrPdfQuality;
    timing: OcrResponseTiming;
}

export type OcrApiResponse = OcrResponse | FailedOcrResponse;

export function isFailedOcrResponse(response: OcrApiResponse | null | undefined): response is FailedOcrResponse {
    return !!response && 'detail' in response;
}

export function isSuccessfulOcrResponse(response: OcrApiResponse | null | undefined): response is OcrResponse {
    return !!response && 'job_id' in response;
}

export const failedOcrResponse: FailedOcrResponse = {
    "detail": "PDF quality validation failed: PDF has orientation issues. Please ensure all pages are correctly oriented before uploading. Your PDF needs rotation. Please upload a correctly oriented file."
}

export const ocrResponse: OcrResponse = {
    job_id: 'cf82286c17f345cfa42cc0e18df9afa2',
    s3_key: null,
    textract_job_id: null,
    status: 'SUCCEEDED',
    error: null,
    ocr_text: null,
    extracted: null,
    verification: null,
    pdf_s3_key: null,
    docx_s3_key: null,
    presigned_url: null,
    filename:
        '1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf',
    created_at: '2026-03-17T19:06:29.826000',
    updated_at: '2026-03-17T19:07:42.721000',
    agreement: {
        doc_type_match: true,
        fy_match: true,
        ulb_name_match: true,
    },
    engines: {
        sarvam: {
            status: 'succeeded',
            result: {
                doc_type: 'BALANCE_SHEET',
                fy: '2020-21',
                as_on_date: '2021-03-31',
                ulb_name: 'Greater Hyderabad Municipal Corporation',
                evidence: {
                    doc_type_snippets: ['Balance Sheet'],
                    fy_snippets: ['2020-21'],
                    ulb_snippets: [
                        'Greater Hyderabad Municipal Corporation',
                        'Greater Hyderabad Municipal Corporation',
                        'G.H.M.C.',
                    ],
                },
                confidence: {
                    doc_type: 1,
                    fy: 1,
                    ulb: 1,
                },
                issues: [],
            },
            page_count: 1,
            ocr_s3_key: 'combined/sarvam/ocr_text/cf82286c17f345cfa42cc0e18df9afa2.json',
            ocr_url:
                'https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/ocr_text/cf82286c17f345cfa42cc0e18df9afa2.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260317%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260317T190701Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=4a0fa91b028c3d23dccbb501dd35aca000ef421c65be87d4f11ba961c01f027f',
            excel_s3_key: 'combined/sarvam/excel/cf82286c17f345cfa42cc0e18df9afa2.xlsx',
            excel_url:
                'https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/excel/cf82286c17f345cfa42cc0e18df9afa2.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260317%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260317T190701Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6009303377f2bab1860618f78b1151d962264bca5593de03ece9e4a41710ad0a',
            timing: {
                ocr_duration_seconds: 12.631535,
                validation_duration_seconds: 8.207621,
                excel_duration_seconds: 1.835757,
            },
        },
        textract: {
            status: 'succeeded',
            result: {
                doc_type: 'BALANCE_SHEET',
                fy: '2020-21',
                as_on_date: '2021-03-31',
                ulb_name: 'Greater Hyderabad Municipal Corporation',
                evidence: {
                    doc_type_snippets: ['Balance Sheet'],
                    fy_snippets: ['2020-21'],
                    ulb_snippets: ['Greater Hyderabad Municipal Corporation'],
                },
                confidence: {
                    doc_type: 1,
                    fy: 1,
                    ulb: 1,
                },
                issues: [],
            },
            page_count: 1,
            textract_job_id: '3ea7ec707963267d3678d0aa8c9dfbc18d995ed9dfa42ae49b355b3f23dd0c27',
            textract_job_type: 'document_analysis',
            textract_input_key:
                'uploads/d54cf36e-978f-45b6-8a9f-eb79043dd4b1-1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf',
            ocr_s3_key: 'combined/textract/ocr_text/cf82286c17f345cfa42cc0e18df9afa2.json',
            ocr_url:
                'https://cf-digitization-dev.s3.amazonaws.com/combined/textract/ocr_text/cf82286c17f345cfa42cc0e18df9afa2.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260317%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260317T190726Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=f5091aa468059f846109a60188de9edb697c4e67ece251eff876eb09377951bf',
            excel_s3_key: 'combined/textract/excel/cf82286c17f345cfa42cc0e18df9afa2.xlsx',
            excel_url:
                'https://cf-digitization-dev.s3.amazonaws.com/combined/textract/excel/cf82286c17f345cfa42cc0e18df9afa2.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260317%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260317T190726Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=b71af46f75e11deacf8e7bf683e52afda209b9f9902e9df67b81d5c64191abd9',
            timing: {
                ocr_duration_seconds: 13.82918,
                validation_duration_seconds: 9.254214,
                excel_duration_seconds: 1.667211,
            },
        },
        tesseract: {
            status: 'succeeded',
            result: {
                doc_type: 'BALANCE_SHEET',
                fy: '2020-21',
                as_on_date: '2021-03-31',
                ulb_name: 'Greater Hyderabad Municipal Corporation',
                evidence: {
                    doc_type_snippets: ['Balance Sheet'],
                    fy_snippets: ['As On 31st March 2021'],
                    ulb_snippets: ['Greater Hyderabad Municipal Corporation'],
                },
                confidence: {
                    doc_type: 1,
                    fy: 1,
                    ulb: 1,
                },
                issues: [],
            },
            page_count: 1,
            ocr_s3_key: 'combined/tesseract/ocr_text/cf82286c17f345cfa42cc0e18df9afa2.json',
            ocr_url:
                'https://cf-digitization-dev.s3.amazonaws.com/combined/tesseract/ocr_text/cf82286c17f345cfa42cc0e18df9afa2.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260317%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260317T190742Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=2ebd5d713de04967defdd950946fe9f726bc2f84d6c164daf3bb30704a6c83c6',
            timing: {
                ocr_duration_seconds: 6.732292,
                validation_duration_seconds: 7.954386,
            },
        },
    },
    errors: {},
    ocr_method: 'combined',
    pdf_quality: {
        checked: true,
        enhancement_applied: true,
        report: {
            status: 'passed',
            blur_scores: [2154.094693315714],
            average_blur_score: 2154.094693315714,
            min_blur_score: 2154.094693315714,
            threshold: 100,
            issues: [],
            pages_checked: [1],
            total_pages: 1,
        },
    },
    timing: {
        total_duration_seconds: 72.894713,
    },
};
