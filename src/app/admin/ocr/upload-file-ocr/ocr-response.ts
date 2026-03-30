export interface OcrEngineEvidence {
    doc_type?: string[] | null;
    fy?: string[] | null;
    ulb_name?: string[] | null;
    as_on_date?: string[] | null;
    auditor_info?: string[] | null | OcrAuditorInfo;
    doc_type_snippets?: string[] | null;
    fy_snippets?: string[] | null;
    ulb_snippets?: string[] | null;
    auditor_name_snippets?: string[];
    auditor_firm_snippets?: string[];
    seal_snippets?: string[];
}

export interface OcrEngineConfidence {
    doc_type?: number | null;
    fy?: number | null;
    ulb?: number | null;
    ulb_name?: number | null;
    as_on_date?: number | null;
    auditor_info?: number | null;
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

export interface OcrValidationRule {
    rule_id?: string | null;
    rule_label?: string | null;
    status?: string | null;
    message?: string | null;
    affected_items?: string[] | null;
    computed_value?: string | number | null;
    expected_value?: string | number | null;
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
    validations?: OcrValidationRule[];
    table_exists?: boolean | null;
    table_count?: number | null;
}

export interface OcrExpectedValues {
    ulb_name?: string | null;
    fy?: string | null;
    doc_type?: string | null;
    table_exists?: boolean | null;
}

export interface OcrExtractedValues extends OcrExpectedValues {
    table_count?: number | null;
    as_on_date?: string | null;
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
    "job_id": "a5a80d76543e466da79b5b9ae389ad4b",
    "status": "SUCCEEDED",
    "error": null,
    "pdf_s3_key": null,
    "filename": "1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
    "created_at": "2026-03-30T16:33:21.204000",
    "updated_at": "2026-03-30T16:36:40.490000",
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
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "as_on_date": "2021-03-31",
                "auditor_info": null,
                "evidence": {
                    "doc_type": [
                        "Balance Sheet"
                    ],
                    "ulb_name": [
                        "Greater Hyderabad Municipal Corporation"
                    ],
                    "fy": [
                        "2020-21"
                    ],
                    "as_on_date": [
                        "31st March 2021"
                    ],
                    "auditor_info": null
                },
                "confidence": {
                    "doc_type": 1,
                    "ulb_name": 1,
                    "fy": 1,
                    "as_on_date": 1,
                    "auditor_info": null
                },
                "validations": [
                    {
                        "rule_id": "BS_001",
                        "rule_label": "Totals must tally with sum of line items",
                        "status": "WARNING",
                        "message": "Sum of Current Liabilities & Provisions (55492.91 + 7.85 + 256884.50 + 2947.79 = 315333.05) differs from reported total (315333.06) by 0.01 due to rounding. Other subtotals tally correctly.",
                        "affected_items": [
                            "Total Current Liabilities & Provisions"
                        ],
                        "computed_value": "315333.05",
                        "expected_value": "315333.06"
                    },
                    {
                        "rule_id": "BS_002",
                        "rule_label": "Total assets must equal total liabilities",
                        "status": "WARNING",
                        "message": "TOTAL ASSETS row is missing from OCR text. However, calculated Total Assets (1473695.72 + 212.50 + 566980.60 = 2040888.82) equals reported Total Liabilities (2040888.82).",
                        "affected_items": [
                            "TOTAL LIABILITIES",
                            "TOTAL ASSETS"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS_003",
                        "rule_label": "Total assets and total liabilities cannot be 0",
                        "status": "PASS",
                        "message": "Total liabilities is 2040888.82 and calculated total assets is 2040888.82.",
                        "affected_items": [
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "> 0"
                    },
                    {
                        "rule_id": "BS_004",
                        "rule_label": "Financial amounts should be numeric",
                        "status": "PASS",
                        "message": "All financial amounts are numeric.",
                        "affected_items": [],
                        "computed_value": null,
                        "expected_value": null
                    }
                ],
                "issues": [
                    "The 'TOTAL ASSETS' row is missing from the OCR text, likely cut off at the bottom of the page.",
                    "Minor rounding difference of 0.01 in 'Total Current Liabilities & Provisions' calculation."
                ],
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 900,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 2704,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 2704
                        }
                    ],
                    "thoughts_token_count": 3264,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 6868,
                    "traffic_type": null
                },
                "table_exists": true,
                "table_count": 1
            },
            "language_tag": "LANG_EN",
            "ocr_language": "en-IN",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/ocr_text/a5a80d76543e466da79b5b9ae389ad4b.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260330%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260330T110427Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=d82f5e91c23b9519ce9232ddd830a583d5ae7d7cdd3817ca24e2817ba0b26a16",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/sarvam/excel/a5a80d76543e466da79b5b9ae389ad4b.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260330%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260330T110427Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6ccbc730bd2474b7a4a99aa89fb08157a51947ab17ff31a578b70cca28c511d0",
            "timing": {
                "ocr_duration_seconds": 13.599295,
                "validation_duration_seconds": 44.563211,
                "excel_duration_seconds": 5.33813
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "string",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": false
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
                    "extracted": true,
                    "match": true,
                    "table_count": 1
                },
                "overall_match": false
            }
        },
        "textract": {
            "status": "succeeded",
            "result": {
                "doc_type": "BALANCE_SHEET",
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "as_on_date": "2021-03-31",
                "auditor_info": null,
                "evidence": {
                    "doc_type": [
                        "Balance Sheet"
                    ],
                    "ulb_name": [
                        "Greater Hyderabad Municipal Corporation"
                    ],
                    "fy": [
                        "2020-21"
                    ],
                    "as_on_date": [
                        "31st March 2021"
                    ],
                    "auditor_info": null
                },
                "confidence": {
                    "doc_type": 1,
                    "ulb_name": 1,
                    "fy": 1,
                    "as_on_date": 1,
                    "auditor_info": null
                },
                "validations": [
                    {
                        "rule_id": "BS_RULE_1",
                        "rule_label": "Totals must tally with sum of line items",
                        "status": "WARNING",
                        "message": "Overall Total Assets and Liabilities tally perfectly at 2040888.82. However, there is a minor rounding difference of 0.01 in Total Current Liabilities & Provisions (calculated sum is 315333.05, reported as 315333.06).",
                        "affected_items": [
                            "Total Current Liabilities & Provisions"
                        ],
                        "computed_value": "315333.05",
                        "expected_value": "315333.06"
                    },
                    {
                        "rule_id": "BS_RULE_2",
                        "rule_label": "Total assets must equal total liabilities",
                        "status": "PASS",
                        "message": "Total Assets (2040888.82) equals Total Liabilities (2040888.82).",
                        "affected_items": [
                            "TOTAL ASSETS",
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS_RULE_3",
                        "rule_label": "Total assets and total liabilities cannot be 0",
                        "status": "PASS",
                        "message": "Total Assets and Liabilities are 2040888.82, which is greater than 0.",
                        "affected_items": [
                            "TOTAL ASSETS",
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "> 0"
                    },
                    {
                        "rule_id": "BS_RULE_4",
                        "rule_label": "Financial amounts should be numeric",
                        "status": "PASS",
                        "message": "All financial amounts parsed successfully as numeric values.",
                        "affected_items": [
                            "All financial figures"
                        ],
                        "computed_value": "Numeric",
                        "expected_value": "Numeric"
                    }
                ],
                "issues": [
                    "Minor rounding difference of 0.01 in Total Current Liabilities & Provisions subtotal (calculated 315333.05 vs reported 315333.06)."
                ],
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 852,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 2540,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 2540
                        }
                    ],
                    "thoughts_token_count": 2737,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 6129,
                    "traffic_type": null
                },
                "table_exists": true,
                "table_count": 2
            },
            "textract_job_id": "57f35418e0ba87bf1cea1b4908d5f6dcc3f0e616ae2b3ab12c3f5c7e9c72c7b8",
            "textract_job_type": "document_analysis",
            "textract_input_key": "uploads/6af57e1b-5755-4b09-9f17-d60e6218228a-1 A.1 Balance Sheet Signed Copy Accounts 2020-21_6dd415e6-334b-46c1-bae6-232bca66da8b.pdf",
            "language_tag": "LANG_EN",
            "ocr_language": "en-IN",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/textract/ocr_text/a5a80d76543e466da79b5b9ae389ad4b.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260330%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260330T110515Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=fd53eb75bc58f07b62ba510d77a0b748f0c308be24e8f288599c8b6831777f25",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/textract/excel/a5a80d76543e466da79b5b9ae389ad4b.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260330%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260330T110515Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=442b71a2d44aac93b703180b19240b260205e0f546294b9741562e1730d04c3c",
            "timing": {
                "ocr_duration_seconds": 10.836989,
                "validation_duration_seconds": 35.671337,
                "excel_duration_seconds": 1.116116
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "string",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": false
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
                    "extracted": true,
                    "match": true,
                    "table_count": 2
                },
                "overall_match": false
            }
        },
        "tesseract": {
            "status": "succeeded",
            "result": {
                "doc_type": "BALANCE_SHEET",
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "fy": "2020-21",
                "as_on_date": "2021-03-31",
                "auditor_info": null,
                "evidence": {
                    "doc_type": [
                        "Balance Sheet"
                    ],
                    "ulb_name": [
                        "Greater Hyderabad Municipal Corporation"
                    ],
                    "fy": [
                        "31st March 2021"
                    ],
                    "as_on_date": [
                        "31st March 2021"
                    ],
                    "auditor_info": null
                },
                "confidence": {
                    "doc_type": 0.99,
                    "ulb_name": 0.99,
                    "fy": 0.95,
                    "as_on_date": 0.99,
                    "auditor_info": null
                },
                "validations": [
                    {
                        "rule_id": "BS_RULE_1",
                        "rule_label": "Totals must tally with sum of line items",
                        "status": "FAIL",
                        "message": "Sum of liability major heads (1971144.75) does not match TOTAL LIABILITIES (2040888.82) due to missing or unreadable line items in OCR.",
                        "affected_items": [
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "1971144.75",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS_RULE_2",
                        "rule_label": "Total assets must equal total liabilities",
                        "status": "PASS",
                        "message": "Total assets (2040888.82) matches total liabilities (2040888.82).",
                        "affected_items": [
                            "TOTAL ASSETS",
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS_RULE_3",
                        "rule_label": "Total assets and total liabilities cannot be 0",
                        "status": "PASS",
                        "message": "Total assets and liabilities are non-zero.",
                        "affected_items": [
                            "TOTAL ASSETS",
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "> 0"
                    },
                    {
                        "rule_id": "BS_RULE_4",
                        "rule_label": "Financial amounts should be numeric",
                        "status": "PASS",
                        "message": "All extracted financial amounts are numeric.",
                        "affected_items": [
                            "All financial line items"
                        ],
                        "computed_value": "Numeric",
                        "expected_value": "Numeric"
                    }
                ],
                "issues": [
                    "Several line items for Current Liabilities & Provisions and Fixed/Current Assets are missing or blank in the OCR text.",
                    "Sum of liability major heads (1971144.75) does not match TOTAL LIABILITIES (2040888.82) due to missing/unrecognized line items in OCR."
                ],
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 848,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 1650,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 1650
                        }
                    ],
                    "thoughts_token_count": 2685,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 5183,
                    "traffic_type": null
                },
                "table_exists": false,
                "table_count": 0
            },
            "language_tag": "LANG_EN",
            "ocr_language": "en-IN",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/tesseract/ocr_text/a5a80d76543e466da79b5b9ae389ad4b.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260330%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260330T110554Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=cca2e758262f9e971e4a123597f391e80c1bb22e47d3ee86ce571b1ba674ec3d",
            "timing": {
                "ocr_duration_seconds": 3.320965,
                "validation_duration_seconds": 34.08034
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "string",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": false
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
                    "extracted": false,
                    "match": false,
                    "table_count": 0
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
                "auditor_info": {},
                "financial_figures": {},
                "validations": [
                    {
                        "rule_id": "BS-T1",
                        "rule_label": "Total Reserves & Surplus tally",
                        "status": "PASS",
                        "message": "Computed Total Reserves & Surplus (12,41,928.54) matches reported value (12,41,928.54). (5,52,429.01 + 15,678.74 + 6,73,820.79 = 12,41,928.54)",
                        "affected_items": [
                            "Municipal (General) Fund",
                            "Earmarked Funds",
                            "Reserves",
                            "Total Reserves & Surplus"
                        ],
                        "computed_value": "1241928.54",
                        "expected_value": "1241928.54"
                    },
                    {
                        "rule_id": "BS-T2",
                        "rule_label": "Total Loans tally",
                        "status": "PASS",
                        "message": "Computed Total Loans (4,83,627.22) matches reported value (4,83,627.22). (2,33,592.22 + 2,50,035.00 + 0.00 = 4,83,627.22)",
                        "affected_items": [
                            "Grants, Contributions For Specific Purposes",
                            "Secured Loans",
                            "Unsecured Loans",
                            "Total Loans"
                        ],
                        "computed_value": "483627.22",
                        "expected_value": "483627.22"
                    },
                    {
                        "rule_id": "BS-T3",
                        "rule_label": "Total Current Liabilities & Provisions tally",
                        "status": "FAIL",
                        "message": "Computed Total Current Liabilities & Provisions (3,15,333.05) does not match reported value (3,15,333.06). (55,492.91 + 7.85 + 2,56,884.50 + 2,947.79 = 3,15,333.05)",
                        "affected_items": [
                            "Deposits Received",
                            "Deposit Works",
                            "Other Liabilities (Sundry Creditors)",
                            "Provisions",
                            "Total Current Liabilities & Provisions"
                        ],
                        "computed_value": "315333.05",
                        "expected_value": "315333.06"
                    },
                    {
                        "rule_id": "BS-T4",
                        "rule_label": "TOTAL LIABILITIES tally",
                        "status": "PASS",
                        "message": "Computed TOTAL LIABILITIES (20,40,888.82) matches reported value (20,40,888.82). (12,41,928.54 + 4,83,627.22 + 3,15,333.06 = 20,40,888.82)",
                        "affected_items": [
                            "Total Reserves & Surplus",
                            "Total Loans",
                            "Total Current Liabilities & Provisions",
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS-T5",
                        "rule_label": "Net Block calculation",
                        "status": "PASS",
                        "message": "Computed Net Block (7,19,481.93) matches reported value (7,19,481.93). (11,68,255.87 - 4,48,773.94 = 7,19,481.93)",
                        "affected_items": [
                            "Gross Block",
                            "Less: Accumulated Depreciation",
                            "Net Block"
                        ],
                        "computed_value": "719481.93",
                        "expected_value": "719481.93"
                    },
                    {
                        "rule_id": "BS-T6",
                        "rule_label": "Total Fixed Assets tally",
                        "status": "PASS",
                        "message": "Computed Total Fixed Assets (14,73,695.72) matches reported value (14,73,695.72). (7,19,481.93 + 7,54,213.79 = 14,73,695.72)",
                        "affected_items": [
                            "Net Block",
                            "Capital Work-in-Progress",
                            "Total Fixed Assets"
                        ],
                        "computed_value": "1473695.72",
                        "expected_value": "1473695.72"
                    },
                    {
                        "rule_id": "BS-T7",
                        "rule_label": "Total Investments tally",
                        "status": "PASS",
                        "message": "Computed Total Investments (212.50) matches reported value (212.50). (212.50 + 0.00 = 212.50)",
                        "affected_items": [
                            "Investments - General Fund",
                            "Investments - Other Funds",
                            "Total Investments"
                        ],
                        "computed_value": "212.50",
                        "expected_value": "212.50"
                    },
                    {
                        "rule_id": "BS-T8",
                        "rule_label": "Net Amount Outstanding (Sundry Debtors) calculation",
                        "status": "PASS",
                        "message": "Computed Net Amount Outstanding (2,55,926.38) matches reported value (2,55,926.38). (4,89,446.38 - 2,33,520.00 = 2,55,926.38)",
                        "affected_items": [
                            "Sundry Debtors (Receivables)",
                            "Less: Accumulated Provision Against Bad And Doubtful Receivables",
                            "Net Amount Outstanding"
                        ],
                        "computed_value": "255926.38",
                        "expected_value": "255926.38"
                    },
                    {
                        "rule_id": "BS-T9",
                        "rule_label": "Total Current Assets, Loans & Advances tally",
                        "status": "PASS",
                        "message": "Computed Total Current Assets, Loans & Advances (5,66,980.60) matches reported value (5,66,980.60). (0.00 + 2,55,926.38 + 0.00 + 1,64,608.51 + 1,46,445.71 + 0.00 = 5,66,980.60)",
                        "affected_items": [
                            "Stock in Hand (Inventories)",
                            "Net Amount Outstanding",
                            "Prepaid Expenses",
                            "Cash & Bank Balances",
                            "Loans, Advances & Deposits",
                            "Less: Accumulated Provision Against Loans",
                            "Total Current Assets, Loans & Advances"
                        ],
                        "computed_value": "566980.60",
                        "expected_value": "566980.60"
                    },
                    {
                        "rule_id": "BS-T10",
                        "rule_label": "TOTAL ASSETS tally",
                        "status": "PASS",
                        "message": "Computed TOTAL ASSETS (20,40,888.82) matches reported value (20,40,888.82). (14,73,695.72 + 212.50 + 5,66,980.60 + 0.00 + 0.00 = 20,40,888.82)",
                        "affected_items": [
                            "Total Fixed Assets",
                            "Total Investments",
                            "Total Current Assets, Loans & Advances",
                            "Other Assets",
                            "Miscellaneous Expenditure",
                            "TOTAL ASSETS"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS-EQ1",
                        "rule_label": "Total Assets equals Total Liabilities",
                        "status": "PASS",
                        "message": "Total Assets (20,40,888.82) equals Total Liabilities (20,40,888.82).",
                        "affected_items": [
                            "TOTAL ASSETS",
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS-NZ1",
                        "rule_label": "Total Assets not zero",
                        "status": "PASS",
                        "message": "Total Assets (20,40,888.82) is not zero.",
                        "affected_items": [
                            "TOTAL ASSETS"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "Not Zero"
                    },
                    {
                        "rule_id": "BS-NZ2",
                        "rule_label": "Total Liabilities not zero",
                        "status": "PASS",
                        "message": "Total Liabilities (20,40,888.82) is not zero.",
                        "affected_items": [
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "Not Zero"
                    },
                    {
                        "rule_id": "BS-NUM1",
                        "rule_label": "Financial amounts are numeric",
                        "status": "PASS",
                        "message": "All extracted financial amounts are numeric.",
                        "affected_items": [],
                        "computed_value": null,
                        "expected_value": null
                    }
                ],
                "confidence": {
                    "doc_type": 0,
                    "fy": 0,
                    "ulb": 0.99,
                    "auditor_name": 0,
                    "auditor_firm": 0,
                    "seal_present": 0,
                    "total_assets": 0,
                    "total_liabilities": 0,
                    "total_income": 0,
                    "total_expenditure": 0,
                    "opening_balance": 0,
                    "closing_balance": 0
                },
                "usage_metadata": {
                    "cache_tokens_details": null,
                    "cached_content_token_count": null,
                    "candidates_token_count": 829,
                    "candidates_tokens_details": null,
                    "prompt_token_count": 2273,
                    "prompt_tokens_details": [
                        {
                            "modality": "TEXT",
                            "token_count": 1181
                        },
                        {
                            "modality": "IMAGE",
                            "token_count": 1092
                        }
                    ],
                    "thoughts_token_count": 3360,
                    "tool_use_prompt_token_count": null,
                    "tool_use_prompt_tokens_details": null,
                    "total_token_count": 6462,
                    "traffic_type": null
                },
                "table_exists": false,
                "table_count": 0
            },
            "model": "gemini-3.1-pro-preview",
            "language_tag": "LANG_UNKNOWN",
            "ocr_language": "unknown",
            "ocr_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/gemini_vision/ocr_text/a5a80d76543e466da79b5b9ae389ad4b.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260330%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260330T110640Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=ed99d3e2f057843995a5f812f331581c526f49af0343b71d66e3ad3191571848",
            "excel_url": "https://cf-digitization-dev.s3.amazonaws.com/combined/gemini_vision/excel/a5a80d76543e466da79b5b9ae389ad4b.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260330%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260330T110638Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=11bda6bc02161219416e8736b0027ff4a1bc3ab1d18b45d1870a4caffea87764",
            "timing": {
                "ocr_duration_seconds": 42.025274,
                "excel_duration_seconds": 2.74337
            },
            "match_summary": {
                "ulb_name": {
                    "expected": "string",
                    "extracted": "Greater Hyderabad Municipal Corporation",
                    "match": false
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
                    "extracted": false,
                    "match": false,
                    "table_count": 0
                },
                "overall_match": false
            }
        }
    },
    "errors": {},
    "expected": {
        "ulb_name": "string",
        "fy": "2020-21",
        "doc_type": "BALANCE_SHEET",
        "table_exists": true
    },
    "language": {
        "primary_language": "mixed",
        "detected_languages": [
            "en-IN",
            "unknown"
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
                "ocr_language": "unknown",
                "language_tag": "LANG_UNKNOWN"
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
                2154.0946933157147
            ],
            "average_blur_score": 2154.0946933157147,
            "min_blur_score": 2154.0946933157147,
            "threshold": 100,
            "issues": [],
            "pages_checked": [
                1
            ],
            "total_pages": 1
        }
    },
    "timing": {
        "total_duration_seconds": 199.285668
    }
}
export const ocrResponse_v2: OcrResponse = {
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
                "validations": [
                    {
                        "rule_id": "BS-GV1",
                        "rule_label": "Total assets equals total liabilities",
                        "status": "PASS",
                        "message": "Gemini Vision extracted matching Total Assets and Total Liabilities values of 2040888.82.",
                        "affected_items": [
                            "TOTAL ASSETS",
                            "TOTAL LIABILITIES"
                        ],
                        "computed_value": "2040888.82",
                        "expected_value": "2040888.82"
                    },
                    {
                        "rule_id": "BS-GV2",
                        "rule_label": "Table detected in document",
                        "status": "PASS",
                        "message": "Gemini Vision detected one tabular section in the uploaded balance sheet.",
                        "affected_items": [
                            "BALANCE SHEET TABLE"
                        ],
                        "computed_value": "1",
                        "expected_value": ">= 1"
                    }
                ],
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
                "ulb_name": "Greater Hyderabad Municipal Corporation",
                "validations": [
                    {
                        "rule_id": "GV_001",
                        "rule_label": "Document type extracted",
                        "status": "PASS",
                        "message": "Gemini Vision identified the document type as bal_sheet.",
                        "affected_items": [
                            "doc_type"
                        ],
                        "computed_value": "bal_sheet",
                        "expected_value": "bal_sheet"
                    }
                ]
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
