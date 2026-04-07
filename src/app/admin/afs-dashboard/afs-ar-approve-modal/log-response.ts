export const logResponse = {
    "_id": "69935d8d8cc2bd42e9cf21f9",
    "ulb": "5eb5844f76a3b61f40ba069e",
    "auditType": "audited",
    "docType": "auditor_report",
    "year": "606aadac4dff55e6c075c507",
    "__v": 0,
    "annualAccountsId": "632969235cef89572df6e0aa",
    "createdAt": "2026-02-16T18:10:21.930Z",
    "ulbFile": {
        "overallConfidenceScore": -1,
        "digitizationStatus": "digitized",
        "requestId": "req-20260221-f479ba",
        "uploadedBy": "ULB",
        "pdfUrl": "/objects/04679fab-edb0-4631-bf7f-e1bc3973e2a1.pdf",
        "noOfPages": 1,
        "queue": {
            "jobId": "19",
            "status": "completed",
            "progress": 100,
            "attemptsMade": 0,
            "createdAt": "2026-02-21T18:44:42.436Z"
        },
        "createdAt": "2026-02-21T18:44:42.438Z",
        "data": {
            "filename": "04679fab-edb0-4631-bf7f-e1bc3973e2a1.pdf",
            "s3_key_pdf": "auditors-report/docs/04679fab-edb0-4631-bf7f-e1bc3973e2a1.pdf",
            "ocr_extraction": {
                "textract_job_id": "f6080ade71cd25dd76cc273090398562a25e58f9e313efdbb9787127bed5e0b0",
                "ocr_text_key": "afs/auditor_report/5eb5844f76a3b61f40ba069e_2020-21_audited_auditor_report_1771699495325.txt",
                "language_tag": "LANG_EN",
                "page_count": 1,
                "is_readable": true,
                "readability_score": 0.717680597014925,
                "status": "SUCCEEDED",
                "error": null,
                "updated_at": "2026-02-21T18:44:50.314Z",
                "presigned_ocr_text_url": "https://cf-digitization-dev.s3.amazonaws.com/auditors-report/docs/6999fd1b01f5cf8c315d7ccc.ocr.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMBHWUBN5KGTKY2E%2F20260221%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260221T184450Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=7bb87b3039c34b8fff9e7a7d9304ec9570b51450fd7ee3dbd7e256de5982aa23"
            },
            "classification": {
                "doc_type": "FULL_AUDIT_REPORT",
                "confidence": 0.95,
                "method": "ai",
                "evidence": [
                    "Audit - Ramanathapuram District - Abiramam (Gr 1) TownPanchayat- Audit on the accounts for the year 2020 - 2021 - Issue of Audit Report - reg.",
                    "the audit on the accounts of Abiramam (Gr 1) Town Panchayat for the year 2020 - 2021 has been preferred and completed.",
                    "The Audit Report mentioning the defects and irregularities are hereby issued for your perusal."
                ],
                "reason": "The document explicitly mentions the 'Issue of Audit Report' and refers to defects and irregularities found during the audit of accounts for the year 2020-2021.",
                "status": "SUCCEEDED",
                "error": null,
                "updated_at": "2026-02-21T18:44:52.233Z"
            },
            "audit": {
                "extraction": {
                    "audit_firm": "Local Fund Audit",
                    "auditor_name": "Assistant Director",
                    "audit_date": "04.02.2022",
                    "audit_place": "Ramanathapuram",
                    "evidence_quotes": [
                        "LOCAL FUND AUDIT DEPARTMENT",
                        "Assistant Director,",
                        "Local Fund Audit,",
                        "R.C.No.38/A1/2022 Dated: 04.02.2022.",
                        "Ramanathapuram."
                    ],
                    "method": "ai",
                    "confidence": 0.7
                },
                "verification": {
                    "audit_firm": {
                        "value": "Local Fund Audit",
                        "verified": true,
                        "match_type": "direct"
                    },
                    "auditor_name": {
                        "value": "Assistant Director",
                        "verified": true,
                        "match_type": "direct"
                    },
                    "audit_date": {
                        "value": "04.02.2022",
                        "verified": true,
                        "match_type": "direct"
                    },
                    "audit_place": {
                        "value": "Ramanathapuram",
                        "verified": true,
                        "match_type": "direct"
                    }
                },
                "verification_status": "VERIFIED",
                "status": "SUCCEEDED",
                "error": null,
                "updated_at": "2026-02-21T18:44:53.724Z"
            },
            "summary": {
                "data": {
                    "bullets": [
                        "Audit of Abiramam (Gr 1) Town Panchayat accounts for the year 2020-2021 has been completed.",
                        "An audit report detailing defects and irregularities has been issued.",
                        "Replies to objections in the audit report should be sent within two months of receipt.",
                        "Replies require approval of the Town Panchayat council.",
                        "The audit report should be sent in three copies.",
                        "Receipt of the report should be acknowledged."
                    ],
                    "key_sections_detected": [
                        "Audit Report Issue",
                        "Reference to Government Orders",
                        "Instructions for Responding to Audit Objections",
                        "Report Distribution"
                    ],
                    "risks_or_issues": [],
                    "evidence_quotes": [
                        "Audit on the accounts of Abiramam (Gr 1) Town Panchayat for the year 2020 - 2021 has been preferred and completed.",
                        "The Audit Report mentioning the defects and irregularities are hereby issued for your perusal.",
                        "Replies to the objections should be sent to this office with the approval of Town Panchayat council within two months"
                    ],
                    "model": "gemini-2.0-flash",
                    "status": "SUCCEEDED",
                    "updated_at": "2026-02-21T18:44:55.882Z"
                },
                "status": "SUCCEEDED",
                "error": null,
                "updated_at": "2026-02-21T18:44:55.882Z"
            },
            "processing": {
                "status": "SUCCEEDED",
                "created_at": "2026-02-21T18:44:43.678Z",
                "updated_at": "2026-02-21T18:44:55.888Z"
            }
        },
        "digitizedFileUrl": "afs/auditor_report/5eb5844f76a3b61f40ba069e_2020-21_audited_auditor_report_1771699495325.txt"
    },
    "updatedAt": "2026-02-21T18:44:55.684Z"
}
