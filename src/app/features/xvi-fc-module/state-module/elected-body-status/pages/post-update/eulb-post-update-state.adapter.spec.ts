import {
  EulbPostSubmissionUpdateRow,
  EulbPostSubmissionUpdateValidateData,
  EulbPostSubmissionUpdateValidateRowPayload,
} from '../../eulb-status.models';
import {
  EulbPostUpdateStateAdapter,
  postUpdatePayloadMatchesRow,
  rowToPostUpdateValidatePayload,
} from './eulb-post-update-state.adapter';

describe('EulbPostUpdateStateAdapter', () => {
  function createRow(overrides: Partial<EulbPostSubmissionUpdateRow> = {}): EulbPostSubmissionUpdateRow {
    return {
      _id: 'row-1',
      rowNumber: 1,
      censusCode: '100001',
      ulbName: 'Test ULB',
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2020-01-01',
      dateOfExpiry: '2030-01-01',
      remarks: null,
      rowType: 'DB_ULB',
      validationStatus: 'VALID',
      errors: [],
      ...overrides,
    };
  }

  function createPayload(
    overrides: Partial<EulbPostSubmissionUpdateValidateRowPayload> = {},
  ): EulbPostSubmissionUpdateValidateRowPayload {
    return {
      rowId: 'row-1',
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2020-01-01',
      dateOfExpiry: '2030-01-01',
      remarks: '',
      ...overrides,
    };
  }

  function createValidationData(
    overrides: Partial<EulbPostSubmissionUpdateValidateData> = {},
  ): EulbPostSubmissionUpdateValidateData {
    return {
      validationStatus: 'VALID',
      rows: [
        {
          rowId: 'row-1',
          rowNumber: 1,
          censusCode: '100001',
          ulbName: 'Test ULB',
          electedBodyStatus: 'Constituted',
          dateOfConstitution: '2020-01-01',
          dateOfExpiry: '2030-01-01',
          remarks: 'Updated',
          validationStatus: 'VALID',
          errors: [],
        },
      ],
      errorRowCount: 0,
      validRowCount: 1,
      totalRowCount: 1,
      ...overrides,
    };
  }

  it('overlays changed row values over loaded row values', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const loadedRow = createRow();
    adapter.storeLoadedRows([loadedRow]);

    adapter.updateChangedRow(
      loadedRow._id,
      createPayload({
        electedBodyStatus: 'Not Constituted',
        dateOfConstitution: '2021-02-03',
        dateOfExpiry: '2031-02-03',
        remarks: 'Changed locally',
      }),
    );

    const row = adapter.overlayRowWithLocalState(loadedRow);

    expect(row.electedBodyStatus).toBe('Not Constituted');
    expect(row.dateOfConstitution).toBe('2021-02-03');
    expect(row.dateOfExpiry).toBe('2031-02-03');
    expect(row.remarks).toBe('Changed locally');
  });

  it('leaves unchanged rows identical', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const loadedRow = createRow();

    adapter.storeLoadedRows([loadedRow]);

    expect(adapter.overlayRowWithLocalState(loadedRow)).toBe(loadedRow);
    expect(adapter.overlayRowsWithLocalState([loadedRow])[0]).toBe(loadedRow);
  });

  it('reset removes one changed row and restores loaded values', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const loadedRow = createRow();
    adapter.storeLoadedRows([loadedRow]);
    adapter.updateChangedRow(loadedRow._id, createPayload({ remarks: 'Changed locally' }));

    const resetRow = adapter.resetRow(loadedRow._id);

    expect(resetRow).toBe(loadedRow);
    expect(adapter.getChangedRowCount()).toBe(0);
    expect(adapter.overlayRowWithLocalState(loadedRow)).toBe(loadedRow);
  });

  it('payload matching returns true for same editable values', () => {
    const row = createRow({ dateOfConstitution: '2020-01-01T00:00:00.000Z', remarks: null });

    expect(
      postUpdatePayloadMatchesRow(
        createPayload({
          dateOfConstitution: '2020-01-01',
          remarks: '',
        }),
        row,
      ),
    ).toBeTrue();
  });

  it('payload matching returns false when editable values differ', () => {
    const row = createRow();

    expect(postUpdatePayloadMatchesRow(createPayload({ remarks: 'Changed locally' }), row)).toBeFalse();
  });

  it('marks validation state stale when a row changes after valid validation', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const loadedRow = createRow();
    adapter.storeLoadedRows([loadedRow]);

    adapter.updateChangedRow(loadedRow._id, createPayload({ remarks: 'Changed locally' }));

    expect(adapter.nextValidationStateAfterLocalChange('VALID')).toBe('STALE');
  });

  it('applies validation errors to the correct row and field', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const rowOne = createRow({ _id: 'row-1', rowNumber: 1, ulbName: 'First ULB' });
    const rowTwo = createRow({ _id: 'row-2', rowNumber: 2, censusCode: '100002', ulbName: 'Second ULB' });
    adapter.storeLoadedRows([rowOne, rowTwo]);
    adapter.updateChangedRow(rowTwo._id, createPayload({ rowId: 'row-2', remarks: 'Changed row two' }));

    const rows = adapter.applyValidationData(
      createValidationData({
        validationStatus: 'INVALID',
        rows: [
          {
            rowId: 'row-2',
            rowNumber: 2,
            censusCode: '100002',
            ulbName: 'Second ULB',
            electedBodyStatus: 'Constituted',
            dateOfConstitution: '2020-01-01',
            dateOfExpiry: '2030-01-01',
            remarks: 'Changed row two',
            validationStatus: 'INVALID',
            errors: [{ field: 'remarks', code: 'invalid', message: 'Remarks are invalid.' }],
          },
        ],
        errorRowCount: 1,
        validRowCount: 0,
        totalRowCount: 1,
      }),
      [rowOne, rowTwo],
    );

    expect(rows[0]).toBe(rowOne);
    expect(rows[1].validationStatus).toBe('INVALID');
    expect(rows[1].errors).toEqual([{ field: 'remarks', code: 'invalid', message: 'Remarks are invalid.' }]);
  });

  it('clears previous validation errors for rows returned as valid', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const loadedRow = createRow();
    adapter.storeLoadedRows([loadedRow]);
    adapter.updateChangedRow(loadedRow._id, createPayload({ remarks: 'Updated' }));

    const invalidRows = adapter.applyValidationData(
      createValidationData({
        validationStatus: 'INVALID',
        rows: [
          {
            rowId: 'row-1',
            rowNumber: 1,
            censusCode: '100001',
            ulbName: 'Test ULB',
            electedBodyStatus: 'Constituted',
            dateOfConstitution: '2020-01-01',
            dateOfExpiry: '2030-01-01',
            remarks: 'Updated',
            validationStatus: 'INVALID',
            errors: [{ field: 'remarks', code: 'invalid', message: 'Old error.' }],
          },
        ],
        errorRowCount: 1,
        validRowCount: 0,
        totalRowCount: 1,
      }),
      [loadedRow],
    );
    expect(invalidRows[0].errors.length).toBe(1);

    const validRows = adapter.applyValidationData(createValidationData(), [loadedRow]);

    expect(validRows[0].validationStatus).toBe('VALID');
    expect(validRows[0].errors).toEqual([]);
  });

  it('builds submit payloads with only changed rows', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const rowOne = createRow({ _id: 'row-1', rowNumber: 1, ulbName: 'First ULB' });
    const rowTwo = createRow({ _id: 'row-2', rowNumber: 2, censusCode: '100002', ulbName: 'Second ULB' });
    adapter.storeLoadedRows([rowOne, rowTwo]);

    adapter.updateChangedRow(rowTwo._id, createPayload({ rowId: 'row-2', remarks: 'Changed row two' }));

    expect(adapter.buildChangedRowsPayload()).toEqual([createPayload({ rowId: 'row-2', remarks: 'Changed row two' })]);
  });

  it('keeps the changed row map immutable from the component perspective', () => {
    const adapter = new EulbPostUpdateStateAdapter();
    const loadedRow = createRow();
    adapter.storeLoadedRows([loadedRow]);
    adapter.updateChangedRow(loadedRow._id, createPayload({ remarks: 'Changed locally' }));

    const snapshot = adapter.getChangedRows();
    const payload = snapshot.get(loadedRow._id);
    if (!payload) {
      fail('Expected changed-row snapshot to contain row-1.');
      return;
    }

    payload.remarks = 'External mutation';
    adapter.updateChangedRow(loadedRow._id, createPayload({ remarks: 'Changed again' }));

    expect(snapshot.get(loadedRow._id)?.remarks).toBe('External mutation');
    expect(adapter.getChangedPayload(loadedRow._id)?.remarks).toBe('Changed again');
  });

  it('creates validate payloads from loaded rows', () => {
    expect(
      rowToPostUpdateValidatePayload(
        createRow({
          dateOfConstitution: '2020-01-01T00:00:00.000Z',
          dateOfExpiry: null,
          remarks: null,
        }),
      ),
    ).toEqual(createPayload({ dateOfConstitution: '2020-01-01', dateOfExpiry: null, remarks: '' }));
  });
});
