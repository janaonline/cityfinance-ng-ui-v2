import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { InrFormatPipe } from '../../../../core/pipes/inr-format.pipe';

const HEADERS = [
  { key: 'code', value: 'Account Code', class: 'text-center' },
  { key: 'lineItem', value: 'Major Group/Minor Group', class: '' },
  { key: '202223', value: '2022-23', class: 'text-end', number: true },
  { key: '202122', value: '2021-22', class: 'text-end', number: true },
  { key: '202021', value: '2020-21', class: 'text-end', number: true },
  { key: '201920', value: '2019-20', class: 'text-end', number: true },
  { key: '201819', value: '2018-19', class: 'text-end', number: true },
  { key: '201718', value: '2017-18', class: 'text-end', number: true },
];
const ELEMENTDATA = [
  {
    code: null,
    lineItem: 'A.Income',
    202223: null,
    202122: null,
    202021: null,
    201920: null,
    201819: null,
    201718: null,
    class: 'fw-bold',
  },
  {
    code: 110,
    lineItem: 'Tax Revenue',
    202223: -18259654000,
    202122: -1744485400,
    202021: -17017214000,
    201920: -15975330000,
    201819: -13110641000,
    201718: -11293299000,
  },
  {
    code: 120,
    reportType: 'summary',
    lineItem: 'Assigned Revenues & Compensation',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 130,
    reportType: 'summary',
    lineItem: 'Rental Income from Municipal Properties',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 140,
    reportType: 'summary',
    lineItem: 'Fee & User Charges',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 150,
    reportType: 'summary',
    lineItem: 'Sale & Hire charges',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: '120-150',
    reportType: 'detailed',
    lineItem: 'Non-Tax Revenue',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 160,
    lineItem: 'Revenue Grants, Contributions & Subsidies',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 170,
    reportType: 'summary',
    lineItem: 'Income from Investment',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 171,
    reportType: 'summary',
    lineItem: 'Interest earned',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 180,
    reportType: 'summary',
    lineItem: 'Other Income',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: '170-180',
    reportType: 'detailed',
    lineItem: 'Other Income',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 100,
    lineItem: 'Others',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },

  {
    code: null,
    lineItem: 'Total Income (A)',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
    info: 'Calculation: (110 + 120 + 130 + 140 + 150 + 160 + 170 + 171 + 180 + 100)',
    class: 'fw-bold',
  },

  {
    code: null,
    lineItem: 'B.Expenditure',
    202223: null,
    202122: null,
    202021: null,
    201920: null,
    201819: null,
    201718: null,
    class: 'fw-bold',
  },
  {
    code: 210,
    lineItem: 'Establishment Expenses',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 220,
    lineItem: 'Administrative Expenses',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 230,
    lineItem: 'Operation & Maintenance',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 240,
    lineItem: 'Interest & Finance Charges',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 250,
    reportType: 'summary',
    lineItem: 'Programme Expenses',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 260,
    lineItem: 'Revenue Grants, Contributions & Subsidies (Exp)',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 270,
    reportType: 'summary',
    lineItem: 'Provisions and Write Off',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 271,
    lineItem: 'Miscellaneous Expenses',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 272,
    reportType: 'summary',
    lineItem: 'Depreciation on Fixed Assets',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: '250, 270-272',
    reportType: 'detailed',
    lineItem: 'Other Income',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },
  {
    code: 200,
    lineItem: 'Others',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },

  {
    code: null,
    lineItem: 'Total Expenditure(B)',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
    info: 'Calculation: (210 + 220 + 230 + 240 + 250 + 260 + 270 + 271 + 272 + 200)',
    class: 'fw-bold',
  },

  {
    code: null,
    lineItem:
      'Gross Surplus/(Deficit) of Income over Expenditure before Prior Period Items (C) (A-B)',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
    class: 'fw-bold',
  },

  {
    code: 280,
    lineItem: 'Prior Period items',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },

  {
    code: null,
    lineItem:
      'Gross Surplus/(Deficit) of Income over Expenditure after Prior Period Items item(D) (C+280)',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
    class: 'fw-bold',
  },

  {
    code: 290,
    lineItem: 'Transfer to Reserve Funds',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
  },

  {
    code: null,
    lineItem: 'Net Surplus/(Deficit) carried over (E) (D+290)',
    202223: 12345678,
    202122: 12345678,
    202021: 12345678,
    201920: 12345678,
    201819: 12345678,
    201718: 234567789,
    class: 'fw-bold',
  },
];

@Component({
  selector: 'app-balancesheet-incomestatement',
  imports: [MatTableModule, MatTooltipModule, InrFormatPipe, CommonModule, ReactiveFormsModule],
  templateUrl: './balancesheet-incomestatement.component.html',
  styleUrl: './balancesheet-incomestatement.component.scss',
})
export class BalancesheetIncomestatementComponent implements OnInit, OnDestroy {
  readonly buttons = [
    { key: 'balanceSheet', label: 'Balance Sheet' },
    { key: 'incomeStatement', label: 'Income Statement' },
  ];
  readonly radioOptions = [
    {
      title: 'Report Type',
      controlName: 'reportType',
      options: [
        { key: 'summary', label: 'Summary' },
        { key: 'detailed', label: 'Detailed' },
      ],
    },
    {
      title: 'Value Format',
      controlName: 'valueType',
      options: [
        { key: 'absolute', label: 'Absolute' },
        { key: 'perCapita', label: 'Per Capita' },
      ],
    },
  ];
  readonly currencyFormats = [
    { key: 'inr', label: 'INR' },
    { key: 'k', label: 'INR Thousands' },
    { key: 'lakh', label: 'INR Lakhs' },
    { key: 'cr', label: 'INR Crore' },
  ];
  readonly currencyOptions = { showSymbol: false, showUnit: false };
  selectedBtn = 'incomeStatement';
  reportForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  readonly headers = HEADERS;
  displayedColumns: string[] = HEADERS.map((h) => h.key);
  dataSource: unknown[] = [];
  private population = 1234;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.updateTableData();
    // console.log('form initiated');
  }

  private initializeForm(): void {
    this.reportForm = this.fb.group({
      reportType: ['summary'],
      valueType: ['absolute'],
      currencyFormat: ['inr'],
    });

    // Handle valueType changes (enable/disable currencyFormat)
    this.subscriptions.push(
      this.reportForm.get('valueType')!.valueChanges.subscribe((value) => {
        const currencyControl = this.reportForm.get('currencyFormat')!;
        if (value === 'perCapita') {
          currencyControl.setValue('inr');
          currencyControl.disable();
        } else currencyControl.enable();
      }),
    );

    // Update table when reportType changes
    this.subscriptions.push(
      this.reportForm.get('reportType')!.valueChanges.subscribe(() => this.updateTableData()),
    );
  }

  get reportType(): string {
    return this.reportForm.get('reportType')?.value ?? 'summary';
  }

  get valueType(): string {
    return this.reportForm.get('valueType')?.value ?? 'absolute';
  }

  get currencyFormat(): 'inr' | 'k' | 'lakh' | 'cr' {
    return this.reportForm.get('currencyFormat')?.value ?? 'inr';
  }

  private updateTableData(): void {
    this.dataSource = ELEMENTDATA.filter((ele) => ele.reportType !== this.reportType);
  }

  getFormattedValue(value: number): number {
    return this.valueType === 'perCapita' ? value / this.population : value;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
