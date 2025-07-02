import { CommonModule } from '@angular/common';
import { Component, effect, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { cloneDeep } from 'lodash';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AfsPopupData, BsIsData, ButtonObj } from '../../../../core/models/interfaces';
import { InrFormatPipe } from '../../../../core/pipes/inr-format.pipe';
import { CommonService } from '../../../../core/services/common.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { AfsPdfsDialogComponent } from '../../../../shared/components/afs-pdfs-dialog/afs-pdfs-dialog.component';
import { TabButtonsComponent } from '../../../../shared/components/shared-ui/tab-buttons.component';
import { DashboardService } from '../../dashboard.service';
type DownloadReportElement = {
  type: string;
  key: string;
  [year: string]: string;
};

interface TableColumns {
  key: string;
  value: string;
  class?: string;
  number?: boolean;
  width?: string;
}

@Component({
  selector: 'app-balancesheet-incomestatement',
  imports: [
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    InrFormatPipe,
    CommonModule,
    ReactiveFormsModule,
    TabButtonsComponent,
    MatProgressSpinner,
  ],
  templateUrl: './balancesheet-incomestatement.component.html',
  styleUrl: './balancesheet-incomestatement.component.scss',
})
export class BalancesheetIncomestatementComponent implements OnInit, OnDestroy {
  // @Input() years!: string[];
  // @Input() ulbId!: string;
  readonly yearsSignal = input<string[]>([]);
  readonly ulbIdSignal = input<string>('');
  private destroy$ = new Subject<void>();

  readonly fileLink = `${environment.STORAGE_BASEURL}/GlobalFiles/STANDARDIZATION_PROCESS_OF_ANNUAL_FINANCIAL_STATEMENT_OF_ULBS_f6e6b60b-2245-4104-803f-0fe01e33ae90.pdf`;
  readonly buttons: ButtonObj[] = [
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
  // selectedBtn = 'balanceSheet';
  selectedBtn = signal<string>('');
  reportForm!: FormGroup;
  isLoading: boolean = true;
  private subscriptions: Subscription[] = [];

  readonly HEADERS_STRUCTURE: TableColumns[] = [
    { key: 'code', value: 'Account Code', class: 'text-center', number: false },
    { key: 'lineItem', value: 'Major Group/Minor Group', class: '', number: false, width: '500px' },
  ];
  headers!: TableColumns[];
  displayedColumns!: string[];
  dataSource: object[] = [];
  filteredDataSource = new MatTableDataSource<object>();
  ledgerData!: BsIsData[];
  private population!: number;

  readonly DOWNLOAD_REPORTS_HEADERS_STRUCTURE: TableColumns[] = [
    { key: 'type', value: 'Download Report', class: '' },
  ];
  downloadReportsHeaders!: TableColumns[];
  downloadReportsDisplayedColumns!: string[];
  downloadReportsDataSource: DownloadReportElement[] = [
    { type: 'Raw PDF', key: 'pdf' },
    { type: 'Raw Excel', key: 'excel' },
  ];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private commonService: CommonService,
    private utilityService: UtilityService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // this.getBsIsData();
    // this.createHeaders();
    this.initializeForm();
    // this.updateTableData();
    // console.log('form initiated', this.ulbIdSignal());
  }

  private getBsIsData(): void {
    if (!this.ulbIdSignal() || !this.selectedBtn()) return;
    this.isLoading = true;

    this.dashboardService
      .getBsIsData(this.ulbIdSignal(), this.selectedBtn())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log('getBsIsData() called');
          this.ledgerData = res['data'];
          this.population = res['population'];
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to get data: getBsIsData()', error);
        },
        complete: () => this.updateTableData(),
      });
  }

  readonly ulbChange = effect(() => {
    if (this.ulbIdSignal()) this.getBsIsData();
  });

  readonly yearsChange = effect(() => {
    if (this.yearsSignal()) this.createHeaders();
  });

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

    this.filteredDataSource = new MatTableDataSource(this.dataSource);
  }

  getFormattedValue(value: number): number {
    return this.valueType === 'perCapita' ? value / this.population : value;
  }

  // Create headers based on years [].
  createHeaders(): void {
    console.log('createHeaders() called');

    // Create deep copy.
    // this.headers = JSON.parse(JSON.stringify(this.HEADERS_STRUCTURE));
    // this.downloadReportsHeaders = JSON.parse(JSON.stringify(this.DOWNLOAD_REPORTS_HEADERS_STRUCTURE));
    this.headers = cloneDeep(this.HEADERS_STRUCTURE);
    this.downloadReportsHeaders = cloneDeep(this.DOWNLOAD_REPORTS_HEADERS_STRUCTURE);

    // Generate headers
    this.yearsSignal().forEach((year) => {
      const yearKey = year.replace('-', '');
      // console.log('headers', this.headers);
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
      this.yearsSignal().forEach((year) => {
        const yearKey = year.replace('-', '');
        row[yearKey] = row.key;
      });
    });

    // Generate displayed columns
    this.displayedColumns = this.headers.map((e) => e.key);
    this.downloadReportsDisplayedColumns = this.downloadReportsHeaders.map((e) => e.key);
  }

  // Search feature will filter the content based on search term.
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredDataSource.filter = filterValue.trim().toLowerCase();
  }

  // ----- On selecting file icon from download report table ----
  onFileClick(fileType: 'pdf' | 'excel', selectedYear: string): void {
    console.log('File clicked: ', selectedYear, fileType);

    // Open file - 2015 to 2019.
    const yearSplit = Number(selectedYear.split('-')[0]);
    if (yearSplit < 2019) {
      this.getReportsBefore2019(selectedYear, fileType);
      return;
    }

    // Open dialog box with AFS data - 2019 onwards.
    this.commonService
      .getReports(this.ulbIdSignal(), selectedYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log('getReports', res);
          if (res && res['success']) {
            const type = res['data'][fileType].length ? fileType : 'notFound';
            this.openDialog(res['data'], type);
          }
        },
        error: (error: Error) => console.error('Failed to get file: onFileClick()', error),
      });
  }

  private openDialog(data: AfsPopupData | null, fileType: string) {
    // console.log('openDialog', data);
    const dialogRef = this.dialog.open(AfsPdfsDialogComponent, {
      data: { reportList: data, fileType: fileType },
      width: '500px',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => console.log('The dialog was closed'));
  }

  private getReportsBefore2019(selectedYear: string, fileType: string) {
    let category = 'balanceSheet';
    if (this.selectedBtn() === 'balanceSheet') category = 'balance';
    else if (this.selectedBtn() === 'incomeStatement') category = 'income';

    this.commonService
      .getDataSets(selectedYear, fileType, category, '', '', this.ulbIdSignal())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log(res);
          if (res['data'].length == 0) this.openDialog(null, 'notFound');
          else {
            const target_file_url = environment.STORAGE_BASEURL + res['data'][0]['fileUrl'];
            const target_file_name = res['data'][0]['fileName'];

            if (fileType === 'pdf') window.open(target_file_url, '_blank');
            else if (fileType === 'excel')
              this.utilityService.fetchFile(target_file_url, target_file_name);
          }
        },
        error: (error) => console.error('Failed to get data getDataSets(): ', error),
      });
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    console.log('Button key sent from child to parent:', key);
    this.selectedBtn.set(key);
    // this.getBsIsData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * isHeader: Boolean - Indicates whether the item is a header. Used by the front-end to skip rendering a dash ("-") in the table.
 * reportType: 'detailed' | 'summary' - Specifies the type of report. Helps the front-end filter content based on the selected report type.
 * calculation: Boolean - Flags whether the item requires back-end calculation based on grouped line items.
 * formula: { add: [], sub: [] } - Defines the calculation logic using lists of line item keys to add and subtract.
 * info: Used on front-end to add info icon.
 */
