import { FORM_STATUS } from '../../shared/form-progress/form-progress.component';
import { FC_UNSPENT_DECLARATION_FIELDS } from './fc-unspent-declaration.questions';
import { FcUnspentDeclarationPreviewResponse } from './fc-unspent-declaration.models';

/**
 * UI dev fixture only — stands in for a future backend endpoint. Shape and values are
 * illustrative, not a confirmed API contract. Replace with a real service once one exists.
 */
export const FC_UNSPENT_DECLARATION_MOCK_RESPONSE: FcUnspentDeclarationPreviewResponse = {
  success: true,
  message: 'FC Unspent declaration fetched successfully.',
  data: {
    stateName: 'Sample State',
    applicableFc: '14TH_FC',
    currentFormStatus: FORM_STATUS.IN_PROGRESS,
    permissions: {
      canView: true,
      canEdit: true,
      canFinalSubmit: true,
    },
    actors: [
      {
        action: 'Created by',
        designation: 'State DMA Officer',
        by: '15thfcdesk5@gmail.com',
        date: '2026-07-13T13:06:49.890Z',
      },
      {
        action: 'Updated by',
        designation: 'State DMA Officer',
        by: '15thfcdesk5@gmail.com',
        date: '2026-07-13T13:06:52.370Z',
      },
      // {
      //   action: 'Submitted by',
      //   designation: 'State DMA Officer',
      //   by: '15thfcdesk5@gmail.com',
      //   date: '2026-07-13T13:06:52.369Z',
      // },
    ],
    questions: [
      {
        ...FC_UNSPENT_DECLARATION_FIELDS[0],
        value: 'yes',
      },
      {
        ...FC_UNSPENT_DECLARATION_FIELDS[1],
        value: null,
      },
      {
        ...FC_UNSPENT_DECLARATION_FIELDS[2],
        value: true,
      },
    ],
    ulbOptions: [
      {
        ulbId: '66a000000000000000000001',
        censusCode: '800123',
        sbCode: null,
        ulbName: 'Sample Municipal Corporation',
        allocationAmount: 20,
      },
      {
        ulbId: '66a000000000000000000002',
        censusCode: null,
        sbCode: 'SB-0142',
        ulbName: 'Sample Municipal Council',
        allocationAmount: 8,
      },
      {
        ulbId: '66a000000000000000000003',
        censusCode: '800456',
        sbCode: null,
        ulbName: 'Sample Nagar Panchayat',
        allocationAmount: 12.5,
      },
    ],
    unspentUlbData: [
      {
        slNo: 1,
        ulbId: '66a000000000000000000001',
        censusCode: '800123',
        sbCode: null,
        ulbName: 'Sample Municipal Corporation',
        allocationAmount: 20,
        unspentAmount: 1.5,
        allocationPerc: 7.5,
        eligibility: true,
      },
      {
        slNo: 2,
        ulbId: '66a000000000000000000002',
        censusCode: null,
        sbCode: 'SB-0142',
        ulbName: 'Sample Municipal Council',
        allocationAmount: 8,
        unspentAmount: 1.2,
        allocationPerc: 15,
        eligibility: false,
      },
    ],
  },
};
