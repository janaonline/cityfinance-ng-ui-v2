# XVI-FC Bank Account Form

## Purpose

Standalone Angular form for submitting dedicated XVI-FC PFMS bank account details for a ULB.

## Route And Context

- Route: `xvi-fc-bank-account`
- Context source: `xvifc_ulb_details` from `localStorage`
- Context values used:
  - `ulbName`
  - `stateName`
  - `selectedYear`
  - `ulbId`
  - `designYearId` / `yearId`

## Form Fields

User-entered fields:

- `ifscCode`
- `accountNumber`
- `confirmAccountNumber`
- proof upload

Bank details displayed after IFSC lookup:

- `name`
- `branch`
- `address`
- `city`
- `state`
- `micr`

## IFSC Behaviour

- Trims input.
- Converts to uppercase.
- Debounces lookup by 350 ms.
- Validates with `/^[A-Z]{4}0[A-Z0-9]{6}$/`.
- Uses Razorpay lookup for UX: `https://ifsc.razorpay.com/{IFSC}`.
- Mapping:
  - `BANK` -> `name`
  - `BRANCH` -> `branch`
  - `ADDRESS` -> `address`
  - `CITY` -> `city`
  - `STATE` -> `state`
  - `MICR` -> `micr`

## Backend APIs Used

- `GET /xvi-fc/bank-account?yearId={designYearId}&ulbId={ulbId}`
- `POST /xvi-fc/bank-account`
- `POST /xvi-fc/bank-account/proof/signed-url`

All calls use `environment.api.url2` with the existing `/api/v2/xvi-fc/...` convention.

## Proof Upload Flow

1. Client validates file type and size.
2. Client requests signed URL from `POST /xvi-fc/bank-account/proof/signed-url`.
3. Client uploads file to S3 with `PUT` against the signed URL.
4. Client stores returned metadata in component state.
5. Submit sends metadata only to `POST /xvi-fc/bank-account`.

Proof metadata shape:

```ts
{
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string;
}
```

Do not send multipart files to the bank-account submit endpoint. Do not use `filepath`, `originalName`, or `sizeKb`.

## File Validation

Allowed MIME types:

- `application/pdf`
- `image/jpeg`
- `image/png`

Max size: 5 MB.

## Existing Record Behaviour

If GET returns `null`:

- Form remains empty.
- Form remains editable.

If GET returns a record:

- Shows `accountNumberMasked` only.
- Never shows the full account number.
- Shows proof metadata.
- Hydrates IFSC and bank details.
- Uses `currentFormStatus` for edit gating.

## Editable Statuses

The form is editable only for:

- `FORM_STATUS.NOT_STARTED`
- `FORM_STATUS.IN_PROGRESS`
- `FORM_STATUS.RETURNED_BY_STATE`
- `FORM_STATUS.RETURNED_BY_MOHUA`

Non-editable statuses disable submit/edit controls.

## Submit Gate

Submit is allowed only when:

- form is valid
- IFSC is valid
- bank details are resolved
- account number and confirmation match
- proof exists
- proof has no validation/upload error
- status is editable

## Error Handling

The component handles:

- backend validation error maps by applying messages to relevant controls/proof state
- proof signed-url errors
- S3 upload errors
- submit errors
- missing local context (`ulbId` / `designYearId`)

User-facing messages use the existing snackbar pattern through `UtilityService.triggerSnackbar()`.

## Security Notes

- Full account number is never returned from the backend.
- Frontend must not store or display the full account number after submission.
- Existing records display only `accountNumberMasked` and safe proof metadata.
- Submit requires the user to re-enter account number and confirmation when resubmitting an editable existing record.

## Known Backend TODO

Submit-time server-side IFSC verification is still a backend placeholder. The lookup proxy exists for UX and CORS safety. The backend should be wired to the approved internal IFSC master or Razorpay backend verification source before treating IFSC verification as complete.

