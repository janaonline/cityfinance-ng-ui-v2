import {
  EulbPostSubmissionUpdateRow,
  EulbPostSubmissionUpdateSubmitRowError,
  EulbPostSubmissionUpdateValidateData,
  EulbPostSubmissionUpdateValidateRow,
  EulbPostSubmissionUpdateValidateRowPayload,
} from '../../eulb-status.models';

export type EulbPostUpdateValidationState = 'NOT_VALIDATED' | 'VALID' | 'INVALID' | 'STALE';

export interface EulbPostUpdateChangedRowResult {
  readonly loadedRow: EulbPostSubmissionUpdateRow | null;
}

export function rowToPostUpdateValidatePayload(
  row: EulbPostSubmissionUpdateRow,
): EulbPostSubmissionUpdateValidateRowPayload {
  return {
    rowId: row._id,
    electedBodyStatus: row.electedBodyStatus,
    dateOfConstitution: toDateInputValue(row.dateOfConstitution) || null,
    dateOfExpiry: toDateInputValue(row.dateOfExpiry) || null,
    remarks: row.remarks ?? '',
  };
}

export function postUpdatePayloadMatchesRow(
  payload: EulbPostSubmissionUpdateValidateRowPayload,
  row: EulbPostSubmissionUpdateRow,
): boolean {
  const original = rowToPostUpdateValidatePayload(row);
  return (
    payload.electedBodyStatus === original.electedBodyStatus &&
    payload.dateOfConstitution === original.dateOfConstitution &&
    payload.dateOfExpiry === original.dateOfExpiry &&
    payload.remarks === original.remarks
  );
}

export class EulbPostUpdateStateAdapter {
  private readonly loadedRowsById = new Map<string, EulbPostSubmissionUpdateRow>();
  private readonly changedRowsById = new Map<string, EulbPostSubmissionUpdateValidateRowPayload>();
  private readonly validationRowsById = new Map<string, EulbPostSubmissionUpdateValidateRow>();

  getChangedRows(): ReadonlyMap<string, EulbPostSubmissionUpdateValidateRowPayload> {
    return new Map([...this.changedRowsById].map(([rowId, payload]) => [rowId, copyPayload(payload)]));
  }

  getChangedPayload(rowId: string): EulbPostSubmissionUpdateValidateRowPayload | null {
    const payload = this.changedRowsById.get(rowId);
    return payload ? copyPayload(payload) : null;
  }

  getLoadedRow(rowId: string): EulbPostSubmissionUpdateRow | null {
    return this.loadedRowsById.get(rowId) ?? null;
  }

  hasChangedRow(rowId: string): boolean {
    return this.changedRowsById.has(rowId);
  }

  getChangedRowCount(): number {
    return this.changedRowsById.size;
  }

  buildChangedRowsPayload(): EulbPostSubmissionUpdateValidateRowPayload[] {
    return [...this.changedRowsById.values()].map(copyPayload);
  }

  storeLoadedRows(rows: readonly EulbPostSubmissionUpdateRow[]): void {
    const pageIds = new Set(rows.map((row) => row._id));
    const changedIds = new Set(this.changedRowsById.keys());

    for (const id of this.loadedRowsById.keys()) {
      if (!pageIds.has(id) && !changedIds.has(id)) {
        this.loadedRowsById.delete(id);
        this.validationRowsById.delete(id);
      }
    }

    for (const row of rows) {
      this.loadedRowsById.set(row._id, row);
    }
  }

  updateChangedRow(rowId: string, payload: EulbPostSubmissionUpdateValidateRowPayload): EulbPostUpdateChangedRowResult {
    const loadedRow = this.loadedRowsById.get(rowId);
    if (!loadedRow) return { loadedRow: null };

    if (postUpdatePayloadMatchesRow(payload, loadedRow)) {
      this.changedRowsById.delete(rowId);
    } else {
      this.changedRowsById.set(rowId, copyPayload(payload));
    }

    this.validationRowsById.delete(rowId);
    return { loadedRow };
  }

  resetRow(rowId: string): EulbPostSubmissionUpdateRow | null {
    const loadedRow = this.loadedRowsById.get(rowId);
    if (!loadedRow) return null;

    this.changedRowsById.delete(rowId);
    this.validationRowsById.delete(rowId);
    return loadedRow;
  }

  applyValidationData(
    data: EulbPostSubmissionUpdateValidateData,
    visibleRows: readonly EulbPostSubmissionUpdateRow[],
  ): EulbPostSubmissionUpdateRow[] {
    const changedRowIds = new Set(this.changedRowsById.keys());

    for (const rowId of changedRowIds) {
      this.validationRowsById.delete(rowId);
    }

    for (const row of data.rows) {
      this.validationRowsById.set(row.rowId, row);
    }

    return visibleRows.map((row) =>
      changedRowIds.has(row._id) || this.validationRowsById.has(row._id)
        ? this.overlayRowWithLocalState(this.loadedRowsById.get(row._id) ?? row)
        : row,
    );
  }

  applySubmitRowErrors(
    rowErrors: readonly EulbPostSubmissionUpdateSubmitRowError[],
    visibleRows: readonly EulbPostSubmissionUpdateRow[],
  ): EulbPostSubmissionUpdateRow[] {
    for (const rowError of rowErrors) {
      const baseRow = this.loadedRowsById.get(rowError.rowId) ?? visibleRows.find((row) => row._id === rowError.rowId);
      if (!baseRow) continue;

      this.validationRowsById.set(rowError.rowId, {
        rowId: rowError.rowId,
        rowNumber: rowError.rowNumber,
        censusCode: rowError.censusCode,
        ulbName: rowError.ulbName,
        electedBodyStatus: baseRow.electedBodyStatus,
        dateOfConstitution: baseRow.dateOfConstitution,
        dateOfExpiry: baseRow.dateOfExpiry,
        remarks: baseRow.remarks ?? '',
        validationStatus: 'INVALID',
        errors: rowError.errors,
      });
    }

    return visibleRows.map((row) => (this.validationRowsById.has(row._id) ? this.overlayRowWithLocalState(row) : row));
  }

  overlayRowsWithLocalState(rows: readonly EulbPostSubmissionUpdateRow[]): EulbPostSubmissionUpdateRow[] {
    return rows.map((row) => this.overlayRowWithLocalState(row));
  }

  overlayRowWithLocalState(row: EulbPostSubmissionUpdateRow): EulbPostSubmissionUpdateRow {
    const changedPayload = this.changedRowsById.get(row._id);
    const validatedRow = this.validationRowsById.get(row._id);
    if (!changedPayload && !validatedRow) return row;

    return {
      ...row,
      electedBodyStatus: changedPayload?.electedBodyStatus ?? validatedRow?.electedBodyStatus ?? row.electedBodyStatus,
      dateOfConstitution:
        changedPayload?.dateOfConstitution ?? validatedRow?.dateOfConstitution ?? row.dateOfConstitution,
      dateOfExpiry: changedPayload?.dateOfExpiry ?? validatedRow?.dateOfExpiry ?? row.dateOfExpiry,
      remarks: changedPayload?.remarks ?? validatedRow?.remarks ?? row.remarks,
      validationStatus: validatedRow?.validationStatus ?? row.validationStatus,
      errors: validatedRow?.errors ?? row.errors,
    };
  }

  nextValidationStateAfterLocalChange(currentState: EulbPostUpdateValidationState): EulbPostUpdateValidationState {
    if (this.changedRowsById.size === 0) return 'NOT_VALIDATED';
    if (currentState === 'VALID' || currentState === 'INVALID') return 'STALE';
    return currentState;
  }

  clear(): void {
    this.changedRowsById.clear();
    this.validationRowsById.clear();
  }
}

function toDateInputValue(value: string | null): string {
  if (!value) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function copyPayload(payload: EulbPostSubmissionUpdateValidateRowPayload): EulbPostSubmissionUpdateValidateRowPayload {
  return { ...payload };
}
