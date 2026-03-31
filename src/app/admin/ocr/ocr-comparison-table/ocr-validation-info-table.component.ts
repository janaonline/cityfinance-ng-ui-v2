import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ValidationInfoColumn {
  key: string;
  label: string;
}

interface ValidationInfoRow {
  rule: string;
  values: Record<string, boolean>;
}

@Component({
  standalone: true,
  selector: 'app-ocr-validation-info-table',
  imports: [CommonModule],
  templateUrl: './ocr-validation-info-table.component.html',
  styleUrl: './ocr-validation-info-table.component.scss',
})
export class OcrValidationInfoTableComponent {
  readonly validationInfoColumns: ValidationInfoColumn[] = [
    { key: 'balanceSheetStatement', label: 'Balance Sheet Statement' },
    { key: 'balanceSheetSchedule', label: 'Balance Sheet Schedule' },
    { key: 'incomeExpenditureStatement', label: 'Income Expenditure Statement' },
    { key: 'incomeExpenditureSchedule', label: 'Income Expenditure Schedule' },
    { key: 'cashflow', label: 'Cashflow' },
  ];

  readonly validationInfoRows: ValidationInfoRow[] = [
    {
      rule: 'Totals must tally with sum of line items',
      values: {
        balanceSheetStatement: true,
        balanceSheetSchedule: true,
        incomeExpenditureStatement: true,
        incomeExpenditureSchedule: true,
        cashflow: true,
      },
    },
    {
      rule: 'Total assets = total liabilities',
      values: {
        balanceSheetStatement: true,
        balanceSheetSchedule: true,
        incomeExpenditureStatement: false,
        incomeExpenditureSchedule: false,
        cashflow: false,
      },
    },
    {
      rule: 'Total income cannot be negative',
      values: {
        balanceSheetStatement: false,
        balanceSheetSchedule: false,
        incomeExpenditureStatement: true,
        incomeExpenditureSchedule: true,
        cashflow: false,
      },
    },
    {
      rule: 'Tax revenue cannot be negative',
      values: {
        balanceSheetStatement: false,
        balanceSheetSchedule: false,
        incomeExpenditureStatement: true,
        incomeExpenditureSchedule: true,
        cashflow: false,
      },
    },
    {
      rule: 'Total income/revenue, total expenditure, total assets, total liabilities cannot be 0',
      values: {
        balanceSheetStatement: true,
        balanceSheetSchedule: true,
        incomeExpenditureStatement: true,
        incomeExpenditureSchedule: true,
        cashflow: false,
      },
    },
    {
      rule: 'Financial amounts should be in numbers',
      values: {
        balanceSheetStatement: true,
        balanceSheetSchedule: true,
        incomeExpenditureStatement: true,
        incomeExpenditureSchedule: true,
        cashflow: true,
      },
    },
  ];

  getValidationInfoClass(value: boolean): string {
    return value
      ? 'validation-info-badge validation-info-badge--yes'
      : 'validation-info-badge validation-info-badge--no';
  }
}
