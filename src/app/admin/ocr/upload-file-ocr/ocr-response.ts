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
    doc_type?: string | null;
    fy?: string | null;
    as_on_date?: string | null;
    ulb_name?: string | null;
    evidence?: OcrEngineEvidence;
    confidence?: OcrEngineConfidence;
    issues?: string[];
}

export interface OcrExpectedValues {
    ulb_name?: string | null;
    fy?: string | null;
    doc_type?: string | null;
    table_exists?: boolean | null;
}

export interface OcrExtractedValues extends OcrExpectedValues {
    table_count?: number | null;
}

export interface OcrMatchSummaryField {
    expected?: string | boolean | number | null;
    extracted?: string | boolean | number | null;
    match?: boolean | null;
    table_count?: number | null;
}

export interface OcrMatchSummary {
    ulb_name?: OcrMatchSummaryField;
    fy?: OcrMatchSummaryField;
    doc_type?: OcrMatchSummaryField;
    table_exists?: OcrMatchSummaryField;
    overall_match?: boolean | null;
}

export interface OcrEngineTiming {
    ocr_duration_seconds?: number;
    validation_duration_seconds?: number;
    excel_duration_seconds?: number;
}

export interface OcrEngineResult {
    status: string;
    result?: OcrEngineAnalysis;
    extracted?: OcrExtractedValues;
    expected?: OcrExpectedValues;
    match_summary?: OcrMatchSummary;
    page_count?: number | null;
    ocr_s3_key?: string | null;
    ocr_url?: string | null;
    excel_s3_key?: string | null;
    excel_url?: string | null;
    textract_job_id?: string | null;
    textract_job_type?: string | null;
    textract_input_key?: string | null;
    timing?: OcrEngineTiming;
    language_tag?: string | null;
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
    agreement?: OcrAgreement;
    engines?: Record<string, OcrEngineResult>;
    errors?: Record<string, unknown>;
    expected?: OcrExpectedValues;
    ocr_method: string;
    pdf_quality?: OcrPdfQuality;
    timing?: OcrResponseTiming;
}

export type OcrApiResponse = OcrResponse | FailedOcrResponse;

export function isFailedOcrResponse(response: OcrApiResponse | null | undefined): response is FailedOcrResponse {
    return !!response && 'detail' in response;
}

export function isSuccessfulOcrResponse(response: OcrApiResponse | null | undefined): response is OcrResponse {
    return !!response && 'job_id' in response;
}

export function isErroredOcrJobResponse(response: OcrApiResponse | null | undefined): response is OcrResponse {
    return (
        isSuccessfulOcrResponse(response) &&
        (response.status?.toUpperCase() === 'FAILED' || !!response.error)
    );
}

export const failedOcrResponse: FailedOcrResponse = {
    "detail": "PDF quality validation failed: PDF has orientation issues. Please ensure all pages are correctly oriented before uploading. Your PDF needs rotation. Please upload a correctly oriented file."
}

export const ocrResponse: OcrResponse = {
    "job_id": "c05049f397bd41c282a9a4d186624c25",
    "s3_key": null,
    "textract_job_id": null,
    "status": "SUCCEEDED",
    "error": null,
    "ocr_text": null,
    "extracted": null,
    "verification": null,
    "pdf_s3_key": null,
    "docx_s3_key": null,
    "presigned_url": null,
    "filename": "1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
    "created_at": "2026-03-19T18:31:14.894000",
    "updated_at": "2026-03-19T18:32:33.791000",
    "agreement": {
        "doc_type_match": true,
        "fy_match": true,
        "ulb_name_match": true
    },
    "engines": {
        "sarvam": {
            "status": "succeeded",
            "result": {
                "doc_type": "BALANCE_SHEET",
                "fy": "2020-21",
                "as_on_date": "2021-03-31",
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "evidence": {
                    "doc_type_snippets": [
                        "Balance Sheet"
                    ],
                    "fy_snippets": [
                        "2020-21"
                    ],
                    "ulb_snippets": [
                        "Greater Hyderabad Municipal Corporation",
                        "Greater Hyderabad Municipal Corporation",
                        "G.H.M.C."
                    ]
                },
                "confidence": {
                    "doc_type": 1,
                    "fy": 1,
                    "ulb": 1
                },
                "issues": []
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "BALANCE_SHEET",
                "table_exists": true,
                "table_count": 1
            },
            "page_count": 1,
            "ocr_s3_key": "combined/sarvam/ocr_text/c05049f397bd41c282a9a4d186624c25.json",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/ocr_text/c05049f397bd41c282a9a4d186624c25.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260319%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260319T183134Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=c00110679c0bfae3b61e97a387e3f896816affb39eade014ec39c1766d28603d",
            "excel_s3_key": "combined/sarvam/excel/c05049f397bd41c282a9a4d186624c25.xlsx",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/excel/c05049f397bd41c282a9a4d186624c25.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260319%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260319T183134Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=c4cfefac087a3d0990eaaa34da78ca27cdd94e781fc143d296b87566ca542509",
            "timing": {
                "ocr_duration_seconds": 10.17831,
                "validation_duration_seconds": 6.332487,
                "excel_duration_seconds": 0.645048
            },
            "expected": {
                "ulb_name": null,
                "fy": "2024-25",
                "doc_type": "bal_sheet",
                "table_exists": null
            },
            "match_summary": {
                "ulb_name": {
                    "expected": null,
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": null
                },
                "fy": {
                    "expected": "2024-25",
                    "extracted": "2020-21",
                    "match": false
                },
                "doc_type": {
                    "expected": "bal_sheet",
                    "extracted": "BALANCE_SHEET",
                    "match": true
                },
                "table_exists": {
                    "expected": null,
                    "extracted": true,
                    "match": null,
                    "table_count": 1
                },
                "overall_match": false
            }
        },
        "textract": {
            "status": "succeeded",
            "result": {
                "doc_type": "BALANCE_SHEET",
                "fy": "2020-21",
                "as_on_date": "2021-03-31",
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "evidence": {
                    "doc_type_snippets": [
                        "Balance Sheet"
                    ],
                    "fy_snippets": [
                        "2020-21"
                    ],
                    "ulb_snippets": [
                        "Greater Hyderabad Municipal Corporation"
                    ]
                },
                "confidence": {
                    "doc_type": 1,
                    "fy": 1,
                    "ulb": 1
                },
                "issues": []
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "BALANCE_SHEET",
                "table_exists": true,
                "table_count": 2
            },
            "page_count": 1,
            "textract_job_id": "2556ab5222c7a4b26c9d668ceaea3af08304067d13436e87e1608b6422c66e83",
            "textract_job_type": "document_analysis",
            "textract_input_key": "uploads/a4151b58-3d19-4f86-9c97-0adeb422cae2-1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
            "ocr_s3_key": "combined/textract/ocr_text/c05049f397bd41c282a9a4d186624c25.json",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/textract/ocr_text/c05049f397bd41c282a9a4d186624c25.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260319%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260319T183152Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=391f46e733997b071af92783b53b7909c0a17d8774e807f006a7f682f7124b47",
            "excel_s3_key": "combined/textract/excel/c05049f397bd41c282a9a4d186624c25.xlsx",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/textract/excel/c05049f397bd41c282a9a4d186624c25.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260319%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260319T183152Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=d742be900bbe0b0a8fadcfd425d48be906ea0aeba2e37b4944038a9a7015ee3b",
            "timing": {
                "ocr_duration_seconds": 11.547592,
                "validation_duration_seconds": 5.494415,
                "excel_duration_seconds": 0.600861
            },
            "expected": {
                "ulb_name": null,
                "fy": "2024-25",
                "doc_type": "bal_sheet",
                "table_exists": null
            },
            "match_summary": {
                "ulb_name": {
                    "expected": null,
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": null
                },
                "fy": {
                    "expected": "2024-25",
                    "extracted": "2020-21",
                    "match": false
                },
                "doc_type": {
                    "expected": "bal_sheet",
                    "extracted": "BALANCE_SHEET",
                    "match": true
                },
                "table_exists": {
                    "expected": null,
                    "extracted": true,
                    "match": null,
                    "table_count": 2
                },
                "overall_match": false
            }
        },
        "tesseract": {
            "status": "succeeded",
            "result": {
                "doc_type": "BALANCE_SHEET",
                "fy": "2020-21",
                "as_on_date": "2021-03-31",
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "evidence": {
                    "doc_type_snippets": [
                        "Balance Sheet"
                    ],
                    "fy_snippets": [
                        "As On 31st March 2021"
                    ],
                    "ulb_snippets": [
                        "Greater Hyderabad Municipal Corporation"
                    ]
                },
                "confidence": {
                    "doc_type": 1,
                    "fy": 1,
                    "ulb": 1
                },
                "issues": []
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "BALANCE_SHEET",
                "table_exists": false,
                "table_count": 0
            },
            "page_count": 1,
            "ocr_s3_key": "combined/tesseract/ocr_text/c05049f397bd41c282a9a4d186624c25.json",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/tesseract/ocr_text/c05049f397bd41c282a9a4d186624c25.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260319%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260319T183200Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=54ada47d95461170e2f35b7eb0e15ccfcf2d27b5a6e52673ab2651faad056891",
            "timing": {
                "ocr_duration_seconds": 2.365053,
                "validation_duration_seconds": 5.342976
            },
            "expected": {
                "ulb_name": null,
                "fy": "2024-25",
                "doc_type": "bal_sheet",
                "table_exists": null
            },
            "match_summary": {
                "ulb_name": {
                    "expected": null,
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": null
                },
                "fy": {
                    "expected": "2024-25",
                    "extracted": "2020-21",
                    "match": false
                },
                "doc_type": {
                    "expected": "bal_sheet",
                    "extracted": "BALANCE_SHEET",
                    "match": true
                },
                "table_exists": {
                    "expected": null,
                    "extracted": false,
                    "match": null,
                    "table_count": 0
                },
                "overall_match": false
            }
        },
        "gemini_vision": {
            "status": "succeeded",
            "result": {
                "doc_type": "bal_sheet",
                "fy": "2020-21",
                "ulb_name": "Greater Hyderabad Municipal Corporation"
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "bal_sheet",
                "table_exists": true,
                "table_count": 1
            },
            "page_count": 1,
            "ocr_s3_key": "combined/gemini_vision/ocr_text/c05049f397bd41c282a9a4d186624c25.json",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/gemini_vision/ocr_text/c05049f397bd41c282a9a4d186624c25.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260319%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260319T183233Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=7cfed1008e04e9fff067fc19c09397c74ba008df5494c7cd187c5ad9d79eacc9",
            "excel_s3_key": "combined/gemini_vision/excel/c05049f397bd41c282a9a4d186624c25.xlsx",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/gemini_vision/excel/c05049f397bd41c282a9a4d186624c25.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260319%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260319T183233Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6118c7806eaa04aee63a32964d4129ff78630b2917ccb5c214c0d002c230aa3d",
            "timing": {
                "ocr_duration_seconds": 32.186142,
                "excel_duration_seconds": 0.548509
            },
            "expected": {
                "ulb_name": null,
                "fy": "2024-25",
                "doc_type": "bal_sheet",
                "table_exists": null
            },
            "match_summary": {
                "ulb_name": {
                    "expected": null,
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": null
                },
                "fy": {
                    "expected": "2024-25",
                    "extracted": "2020-21",
                    "match": false
                },
                "doc_type": {
                    "expected": "bal_sheet",
                    "extracted": "bal_sheet",
                    "match": true
                },
                "table_exists": {
                    "expected": null,
                    "extracted": true,
                    "match": null,
                    "table_count": 1
                },
                "overall_match": false
            }
        }
    },
    "errors": {},
    "expected": {
        "ulb_name": null,
        "fy": "2024-25",
        "doc_type": "bal_sheet",
        "table_exists": null
    },
    "ocr_method": "combined",
    "pdf_quality": {
        "checked": true,
        "enhancement_applied": true,
        "report": {
            "status": "passed",
            "blur_scores": [
                2154.094693315714
            ],
            "average_blur_score": 2154.094693315714,
            "min_blur_score": 2154.094693315714,
            "threshold": 100,
            "issues": [],
            "pages_checked": [
                1
            ],
            "total_pages": 1
        }
    },
    "timing": {
        "total_duration_seconds": 78.89755
    }
}
