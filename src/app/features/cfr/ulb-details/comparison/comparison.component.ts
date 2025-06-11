import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Chart, registerables } from 'chart.js';
import { getPopulationCategory } from '../../../../core/util/common';
import { MaterialModule } from '../../../../material.module';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { FiscalRankingService, UlbData } from '../../services/fiscal-ranking.service';
import { ComparisionFiltersComponent } from '../comparision-filters/comparision-filters.component';
Chart.register(...registerables);

@Component({
    selector: 'app-comparison',
    templateUrl: './comparison.component.html',
    styleUrls: ['./comparison.component.scss'],
    imports: [MaterialModule, PreLoaderComponent]
})
export class ComparisonComponent implements OnChanges {
  public chart: any;
  @Input() ulb: any;
  @Input() topUlbs!: UlbData[];
  allTypeGraphData: any = {};
  types = [
    { id: 'overAll', label: 'Over All', maxScore: 1200 },
    { id: 'resourceMobilization', label: 'Resource mobilization', maxScore: 600 },
    { id: 'expenditurePerformance', label: 'Expenditure performance', maxScore: 300 },
    { id: 'fiscalGovernance', label: 'Fiscal Governance', maxScore: 300 },
  ];
  type = 'overAll';
  isPreLoader: boolean = true;
  datasetsFilter: any = {
    // "State Average": true,
    // "National Average": true,
    'Population Average': true,
  };

  ulbs: any = [];
  hasNonBucketUlb = false;
  bucketShortName!: string;

  constructor(
    private matDialog: MatDialog,
    private fiscalRankingService: FiscalRankingService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ulb'].currentValue && this.ulbs.length == 0) {
      this.ulbs = [{ ...this.ulb, disabled: true }, ...this.topUlbs];
      this.bucketShortName = getPopulationCategory(this.ulb?.population)?.shortName;
      this.getBarchartData();
    }
  }

  getBarchartData() {
    this.isPreLoader = true;
    const ulbQuery = this.ulbs.map((item: { ulb: any }) => `ulb[]=${item?.ulb}`).join('&');
    this.fiscalRankingService
      .getBarchartData(ulbQuery, this.ulb?.populationBucket, this.ulb?.stateParticipationCategory)
      .subscribe((res: any) => {
        this.allTypeGraphData = res.graphData;
        this.createChart();
      });
    this.isPreLoader = false;
  }

  get graphData() {
    return this.allTypeGraphData?.[this.type];
  }

  get suggestedMinMax() {
    return this.types?.find((type) => type.id == this.type)?.maxScore;
  }

  createChart() {
    if (this.chart) this.chart.destroy();
    this.hasNonBucketUlb = this.ulbs.some((ulb: any) => {
      return (
        ulb?.populationBucket != this.ulb?.populationBucket ||
        ulb?.stateParticipationCategory != this.ulb?.stateParticipationCategory
      );
    });
    const that = this;
    this.chart = new Chart('bar-chart-with-line', {
      type: 'bar',
      data: {
        ...this.graphData,
        datasets: this.graphData.datasets.map((item: any) => ({
          ...item,
          // backgroundColor: this.getBarBackgroundColor(item),
          hidden: !(this.datasetsFilter[item.label] != undefined
            ? this.datasetsFilter[item.label]
            : true),
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 0,
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 12,
                family: 'Montserrat',
              },
            },
          },
          tooltip: {
            titleFont: {
              size: 14,
              family: 'Montserrat',
            },
            bodyFont: {
              size: 12,
              family: 'Montserrat',
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 12,
                family: 'Montserrat',
              },
            },
          },
          y: {
            ticks: {
              // min: this.suggestedMinMax,
              // max: this.suggestedMinMax,
              beginAtZero: true,
              // stepSize: 100,
              font: {
                size: 12,
                family: 'Montserrat',
              },
            },
          },
        },
      },
    } as any);
  }

  openFilter() {
    this.matDialog
      .open(ComparisionFiltersComponent, {
        width: '500px',
        data: {
          ulbs: this.ulbs,
          ulb: this.ulb,
          bucketShortName: this.bucketShortName,
          datasetsFilter: this.datasetsFilter,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res == 'reset') return this.reset();
          // console.log("res", res);
          this.ulbs = res.ulbs;
          this.datasetsFilter = res.datasetsFilter;
          this.getBarchartData();
        }
      });
  }

  reset() {
    console.log('reset');
    this.ulbs = [{ ...this.ulb, disabled: true }];
    this.datasetsFilter = {
      // "State Average": true,
      // "National Average": true,
      'Population Average': true,
    };
    this.getBarchartData();
  }
}
