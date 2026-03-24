export interface OcrEngineEvidence {
    doc_type_snippets: string[];
    fy_snippets: string[];
    ulb_snippets: string[];
    auditor_name_snippets?: string[];
    auditor_firm_snippets?: string[];
    seal_snippets?: string[];
}

export interface OcrEngineConfidence {
    doc_type: number | null;
    fy: number | null;
    ulb: number | null;
    auditor_name?: number | null;
    auditor_firm?: number | null;
    seal_present?: number | null;
    total_assets?: number | null;
    total_liabilities?: number | null;
    total_income?: number | null;
    total_expenditure?: number | null;
    opening_balance?: number | null;
    closing_balance?: number | null;
}

export interface OcrAuditorInfo {
    auditor_name?: string | null;
    auditor_firm?: string | null;
    seal_present?: boolean | null;
}

export interface OcrFinancialFigures {
    total_assets?: number | null;
    total_liabilities?: number | null;
    total_income?: number | null;
    total_expenditure?: number | null;
    opening_balance?: number | null;
    closing_balance?: number | null;
}

export interface OcrTokenDetail {
    modality: string;
    token_count: number;
}

export interface OcrUsageMetadata {
    cache_tokens_details?: unknown | null;
    cached_content_token_count?: number | null;
    candidates_token_count?: number | null;
    candidates_tokens_details?: unknown | null;
    prompt_token_count?: number | null;
    prompt_tokens_details?: OcrTokenDetail[] | null;
    thoughts_token_count?: number | null;
    tool_use_prompt_token_count?: number | null;
    tool_use_prompt_tokens_details?: unknown | null;
    total_token_count?: number | null;
    traffic_type?: string | null;
}

export interface OcrEngineAnalysis {
    doc_type?: string | null;
    fy?: string | null;
    as_on_date?: string | null;
    ulb_name?: string | null;
    auditor_info?: OcrAuditorInfo | null;
    financial_figures?: OcrFinancialFigures;
    evidence?: OcrEngineEvidence;
    confidence?: OcrEngineConfidence;
    issues?: string[];
    usage_metadata?: OcrUsageMetadata;
}

export interface OcrExpectedValues {
    ulb_name?: string | null;
    fy?: string | null;
    doc_type?: string | null;
    table_exists?: boolean | null;
}

export interface OcrExtractedValues extends OcrExpectedValues {
    table_count?: number | null;
    usage_metadata?: OcrUsageMetadata;
    auditor_info?: OcrAuditorInfo | null;
    financial_figures?: OcrFinancialFigures;
    confidence?: OcrEngineConfidence;
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
    ocr_language?: string | null;
    model?: string | null;
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

export interface OcrFileInfo {
    filename: string;
    page_count?: number | null;
    uploaded_file_size_kb?: number | null;
}

export interface OcrLanguageInfo {
    ocr_language?: string | null;
    language_tag?: string | null;
}

export interface OcrLanguageSummary {
    primary_language?: string | null;
    detected_languages?: string[];
    per_engine?: Record<string, OcrLanguageInfo>;
}

export interface OcrResponseTiming {
    total_duration_seconds: number;
}

export interface FailedOcrResponse {
    detail: string;
}

export interface OcrResponse {
    job_id: string;
    s3_key?: string | null;
    status: string;
    error: string | null;
    ocr_text?: string | null;
    pdf_s3_key?: string | null;
    filename?: string;
    created_at: string;
    updated_at: string;
    file_info?: OcrFileInfo;
    engines?: Record<string, OcrEngineResult>;
    errors?: Record<string, unknown>;
    expected?: OcrExpectedValues;
    language?: OcrLanguageSummary;
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
    "job_id": "14a519794be54bf0a69c9236c9b3aba5",
    "status": "SUCCEEDED",
    "error": null,
    "pdf_s3_key": null,
    "filename": "1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
    "created_at": "2026-03-24T18:40:13.533000",
    "updated_at": "2026-03-24T18:41:19.804000",
    "file_info": {
        "filename": "1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
        "page_count": 1,
        "uploaded_file_size_kb": 197.19140625
    },
    "engines": {
        "sarvam": {
            "status": "succeeded",
            "result": {
                "doc_type": "BALANCE_SHEET",
                "fy": "2020-21",
                "as_on_date": "2021-03-31",
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "auditor_info": null,
                "evidence": {
                    "doc_type_snippets": [
                        "Balance Sheet As On 31st March 2021"
                    ],
                    "fy_snippets": [
                        "2020-21"
                    ],
                    "ulb_snippets": [
                        "Greater Hyderabad Municipal Corporation"
                    ],
                    "auditor_name_snippets": [],
                    "auditor_firm_snippets": [],
                    "seal_snippets": []
                },
                "confidence": {
                    "doc_type": 1.0,
                    "fy": 1.0,
                    "ulb": 1.0,
                    "auditor_name": 0,
                    "auditor_firm": 0,
                    "seal_present": 0
                },
                "issues": [],
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 228,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 2044,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 2044
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 2272,
                    "traffic_type": null
                }
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "BALANCE_SHEET",
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 228,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 2044,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 2044
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 2272,
                    "traffic_type": null
                },
                "table_exists": true,
                "table_count": 1
            },
            "language_tag": "LANG_EN",
            "ocr_language": "en-IN",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/ocr_text/14a519794be54bf0a69c9236c9b3aba5.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260324%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T131034Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=25bf7e5c1e8a6e45ce085ebb2ec49efd2d4e3bda7a7c61d826af2fadd8139fe2",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/excel/14a519794be54bf0a69c9236c9b3aba5.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260324%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T131034Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6242033bb2bef89000c90f82ae0e75e03f85df6f5fd24bcf17a50e820dd357f5",
            "timing": {
                "ocr_duration_seconds": 11.057101,
                "validation_duration_seconds": 4.065867,
                "excel_duration_seconds": 0.811112
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "Greater Hyderabad Municipal Corporation|hyderabad",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": true
                },
                "fy": {
                    "expected": "2020-21",
                    "extracted": "2020-21",
                    "match": true
                },
                "doc_type": {
                    "expected": "BALANCE_SHEET",
                    "extracted": "BALANCE_SHEET",
                    "match": true
                },
                "table_exists": {
                    "expected": true,
                    "extracted": null,
                    "match": false,
                    "table_count": null
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
                "auditor_info": null,
                "evidence": {
                    "doc_type_snippets": [
                        "Balance Sheet As On 31st March 2021"
                    ],
                    "fy_snippets": [
                        "2020-21"
                    ],
                    "ulb_snippets": [
                        "Greater Hyderabad Municipal Corporation"
                    ],
                    "auditor_name_snippets": [],
                    "auditor_firm_snippets": [],
                    "seal_snippets": []
                },
                "confidence": {
                    "doc_type": 1.0,
                    "fy": 1.0,
                    "ulb": 1.0,
                    "auditor_name": 0,
                    "auditor_firm": 0,
                    "seal_present": 0
                },
                "issues": [],
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 234,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 1880,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 1880
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 2114,
                    "traffic_type": null
                }
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "BALANCE_SHEET",
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 234,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 1880,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 1880
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 2114,
                    "traffic_type": null
                },
                "table_exists": true,
                "table_count": 2
            },
            "textract_job_id": "97fc47f37a2695ab8586d1db6930b68017511786c981f03bb2f822e28657ea1f",
            "textract_job_type": "document_analysis",
            "textract_input_key": "uploads/9be45ea5-d148-45a5-8a50-efaee90d8613-1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
            "language_tag": "LANG_EN",
            "ocr_language": "en-IN",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/textract/ocr_text/14a519794be54bf0a69c9236c9b3aba5.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260324%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T131053Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=66ae151b60ce388e3e30a60a0853c053844b5de9e47c9d04935095d47524a1c0",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/textract/excel/14a519794be54bf0a69c9236c9b3aba5.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260324%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T131053Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=54f4ecae1502718a522b96b8c679dd265e34d54e96c4fb898f28e79236182587",
            "timing": {
                "ocr_duration_seconds": 11.843241,
                "validation_duration_seconds": 5.762736,
                "excel_duration_seconds": 0.852928
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "Greater Hyderabad Municipal Corporation|hyderabad",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": true
                },
                "fy": {
                    "expected": "2020-21",
                    "extracted": "2020-21",
                    "match": true
                },
                "doc_type": {
                    "expected": "BALANCE_SHEET",
                    "extracted": "BALANCE_SHEET",
                    "match": true
                },
                "table_exists": {
                    "expected": true,
                    "extracted": null,
                    "match": false,
                    "table_count": null
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
                "auditor_info": null,
                "evidence": {
                    "doc_type_snippets": [
                        "Balance Sheet As On 31st March 2021"
                    ],
                    "fy_snippets": [
                        "Balance Sheet As On 31st March 2021"
                    ],
                    "ulb_snippets": [
                        "Greater Hyderabad Municipal Corporation"
                    ],
                    "auditor_name_snippets": [],
                    "auditor_firm_snippets": [],
                    "seal_snippets": []
                },
                "confidence": {
                    "doc_type": 1.0,
                    "fy": 1.0,
                    "ulb": 1.0,
                    "auditor_name": 0,
                    "auditor_firm": 0,
                    "seal_present": 0
                },
                "issues": [],
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 236,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 990,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 990
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 1226,
                    "traffic_type": null
                }
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "BALANCE_SHEET",
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 236,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 990,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 990
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 1226,
                    "traffic_type": null
                },
                "table_exists": false,
                "table_count": 0
            },
            "language_tag": "LANG_EN",
            "ocr_language": "en-IN",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/tesseract/ocr_text/14a519794be54bf0a69c9236c9b3aba5.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260324%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T131102Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=737b50d76f8a9983ed7d326e83186e1025743f2e180c42a6fb58505928796ffb",
            "timing": {
                "ocr_duration_seconds": 3.635091,
                "validation_duration_seconds": 4.341936
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "Greater Hyderabad Municipal Corporation|hyderabad",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": true
                },
                "fy": {
                    "expected": "2020-21",
                    "extracted": "2020-21",
                    "match": true
                },
                "doc_type": {
                    "expected": "BALANCE_SHEET",
                    "extracted": "BALANCE_SHEET",
                    "match": true
                },
                "table_exists": {
                    "expected": true,
                    "extracted": null,
                    "match": false,
                    "table_count": null
                },
                "overall_match": false
            }
        },
        "gemini_vision": {
            "status": "succeeded",
            "result": {
                "doc_type": "BALANCE_SHEET",
                "fy": "2020-21",
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "auditor_info": {
                    "auditor_name": null,
                    "auditor_firm": null,
                    "seal_present": true
                },
                "financial_figures": {
                    "total_assets": 2040888.82,
                    "total_liabilities": 2040888.82,
                    "total_income": null,
                    "total_expenditure": null,
                    "opening_balance": null,
                    "closing_balance": null
                },
                "confidence": {
                    "doc_type": 1.0,
                    "fy": 1.0,
                    "ulb": 1.0,
                    "auditor_name": 0.0,
                    "auditor_firm": 0.0,
                    "seal_present": 1.0,
                    "total_assets": 1.0,
                    "total_liabilities": 1.0,
                    "total_income": 0.0,
                    "total_expenditure": 0.0,
                    "opening_balance": 0.0,
                    "closing_balance": 0.0
                },
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 2752,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 1838,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 746
                        },
                        {
                            "modality": "IMAGE",
                            "token_count": 1092
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 4590,
                    "traffic_type": null
                }
            },
            "extracted": {
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "doc_type": "BALANCE_SHEET",
                "auditor_info": {
                    "auditor_name": null,
                    "auditor_firm": null,
                    "seal_present": true
                },
                "financial_figures": {
                    "total_assets": 2040888.82,
                    "total_liabilities": 2040888.82,
                    "total_income": null,
                    "total_expenditure": null,
                    "opening_balance": null,
                    "closing_balance": null
                },
                "confidence": {
                    "doc_type": 1.0,
                    "fy": 1.0,
                    "ulb": 1.0,
                    "auditor_name": 0.0,
                    "auditor_firm": 0.0,
                    "seal_present": 1.0,
                    "total_assets": 1.0,
                    "total_liabilities": 1.0,
                    "total_income": 0.0,
                    "total_expenditure": 0.0,
                    "opening_balance": 0.0,
                    "closing_balance": 0.0
                },
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 2752,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 1838,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 746
                        },
                        {
                            "modality": "IMAGE",
                            "token_count": 1092
                        }
                    ],
                    "thoughts_token_count": null,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 4590,
                    "traffic_type": null
                },
                "table_exists": true,
                "table_count": 1
            },
            "model": "gemini-3.1-flash-lite-preview",
            "language_tag": "LANG_EN",
            "ocr_language": "en-IN",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/gemini_vision/ocr_text/14a519794be54bf0a69c9236c9b3aba5.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260324%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T131119Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=d9d45dc3c46ca50345834f385c2b39d4fe6bd788491df58b15f20cb0161d6c0e",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/gemini_vision/excel/14a519794be54bf0a69c9236c9b3aba5.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260324%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T131119Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=25c1e8731772c800d90b66a256f81ddd046220f3571132ef947bbb3fe710cb18",
            "timing": {
                "ocr_duration_seconds": 16.816194,
                "excel_duration_seconds": 0.830016
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "Greater Hyderabad Municipal Corporation|hyderabad",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": true
                },
                "fy": {
                    "expected": "2020-21",
                    "extracted": "2020-21",
                    "match": true
                },
                "doc_type": {
                    "expected": "BALANCE_SHEET",
                    "extracted": "BALANCE_SHEET",
                    "match": true
                },
                "table_exists": {
                    "expected": true,
                    "extracted": null,
                    "match": false,
                    "table_count": null
                },
                "overall_match": false
            }
        }
    },
    "errors": {},
    "expected": {
        "ulb_name": "Greater Hyderabad Municipal Corporation|hyderabad",
        "fy": "2020-21",
        "doc_type": "BALANCE_SHEET",
        "table_exists": true
    },
    "language": {
        "primary_language": "en-IN",
        "detected_languages": [
            "en-IN"
        ],
        "per_engine": {
            "sarvam": {
                "ocr_language": "en-IN",
                "language_tag": "LANG_EN"
            },
            "textract": {
                "ocr_language": "en-IN",
                "language_tag": "LANG_EN"
            },
            "tesseract": {
                "ocr_language": "en-IN",
                "language_tag": "LANG_EN"
            },
            "gemini_vision": {
                "ocr_language": "en-IN",
                "language_tag": "LANG_EN"
            }
        }
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
            "threshold": 100.0,
            "issues": [],
            "pages_checked": [
                1
            ],
            "total_pages": 1
        }
    },
    "timing": {
        "total_duration_seconds": 66.27056
    }
}
export const ocrResponse_bkp: OcrResponse = {
    "job_id": "c05049f397bd41c282a9a4d186624c25",
    "s3_key": null,
    "status": "SUCCEEDED",
    "error": null,
    "ocr_text": null,
    "pdf_s3_key": null,
    "filename": "1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
    "created_at": "2026-03-19T18:31:14.894000",
    "updated_at": "2026-03-19T18:32:33.791000",

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
