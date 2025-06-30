import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BsIsData } from '../../../../core/models/interfaces';
import { InrFormatPipe } from '../../../../core/pipes/inr-format.pipe';
import { DashboardService } from '../../dashboard.service';
type DownloadReportElement = {
  type: string;
  key: string;
  [year: string]: string;
};

@Component({
  selector: 'app-balancesheet-incomestatement',
  imports: [MatTableModule, MatTooltipModule, InrFormatPipe, CommonModule, ReactiveFormsModule],
  templateUrl: './balancesheet-incomestatement.component.html',
  styleUrl: './balancesheet-incomestatement.component.scss',
})
export class BalancesheetIncomestatementComponent implements OnInit, OnDestroy {
  @Input() years!: string[];
  @Input() ulbId!: string;

  readonly fileLink = `${environment.STORAGE_BASEURL}/GlobalFiles/STANDARDIZATION_PROCESS_OF_ANNUAL_FINANCIAL_STATEMENT_OF_ULBS_f6e6b60b-2245-4104-803f-0fe01e33ae90.pdf`;
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
  selectedBtn = 'balanceSheet';
  reportForm!: FormGroup;
  private subscriptions: Subscription[] = [];

  readonly headers = [
    { key: 'code', value: 'Account Code', class: 'text-center', number: false, },
    { key: 'lineItem', value: 'Major Group/Minor Group', number: false, },
  ];
  displayedColumns!: string[];
  dataSource: object[] = [];
  ledgerData!: BsIsData[];
  private population!: number;

  readonly downloadReportsHeaders = [{ key: 'type', value: 'Download Report', class: '' }];
  downloadReportsDisplayedColumns!: string[];
  downloadReportsDataSource: DownloadReportElement[] = [
    { type: 'Raw PDF', key: 'pdf' },
    { type: 'Raw Excel', key: 'excel' },
  ];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
  ) { }

  ngOnInit(): void {
    this.getBsIsData();
    this.createHeaders();
    this.initializeForm();
    // this.updateTableData();
    // console.log('form initiated', this.ulbId);
  }

  private getBsIsData(): void {
    this.dashboardService.getBsIsData(this.ulbId, this.selectedBtn).subscribe({
      next: (res) => {
        this.ledgerData = res['data'];
        this.population = res['population'];
      },
      error: (error) => console.error('Failed to get data: getBsIsData()', error),
      complete: () => this.updateTableData(),
    });
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
    // console.log(this.ledgerData)
    this.dataSource = (this.ledgerData as { reportType?: string }[]).filter(
      (ele) => !ele.reportType || ele.reportType === this.reportType,
    );
  }

  getFormattedValue(value: number): number {
    return this.valueType === 'perCapita' ? value / this.population : value;
  }

  // Create headers based on years [].
  createHeaders(): void {
    // Generate headers
    this.years.forEach((year) => {
      const yearKey = year.replace('-', '');
      this.downloadReportsHeaders.push({
        key: yearKey,
        value: year,
        class: 'text-center',
      });

      this.headers.push({
        key: yearKey,
        value: year,
        class: 'text-end',
        number: true,
      });
    });

    // Update data source with new year keys
    this.downloadReportsDataSource.forEach((row) => {
      this.years.forEach((year) => {
        const yearKey = year.replace('-', '');
        row[yearKey] = row.key;
      });
    });

    // Generate displayed columns
    this.displayedColumns = this.headers.map((e) => e.key);
    this.downloadReportsDisplayedColumns = this.downloadReportsHeaders.map((e) => e.key);
  }

  onFileClick(year: string, fileType: string): void {
    console.log('File clicked: ', year, fileType);
  }

  buttonClick(buttonKey: string): void {
    this.selectedBtn = buttonKey;
    this.getBsIsData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
