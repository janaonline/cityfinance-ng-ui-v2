import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Chart, registerables } from 'chart.js';
// import { getPopulationCategory } from 'src/app/util/common';
// import { FiscalRankingService, UlbData } from '../../fiscal-ranking.service';
import { ComparisionFiltersComponent } from '../comparision-filters/comparision-filters.component';
import { MaterialModule } from '../../../../material.module';
import { getPopulationCategory } from '../../../../core/util/common';
import { FiscalRankingService, UlbData } from '../../services/fiscal-ranking.service';
Chart.register(...registerables)


@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class ComparisonComponent implements OnChanges {
  public chart: any;
  @Input() ulb: any;
  @Input() topUlbs!: UlbData[];
  allTypeGraphData: any = {};
  types = [
    { id: 'overAll', label: 'Over All', maxScore: 1200 },
    { id: 'resourceMobilization', label: 'Resource mobilisation', maxScore: 600 },
    { id: 'expenditurePerformance', label: 'Expenditure performance', maxScore: 300 },
    { id: 'fiscalGovernance', label: 'Fiscal Governance', maxScore: 300 }
  ];
  type = 'overAll';

  datasetsFilter: any = {
    "State Average": true,
    "National Average": true,
    "Population Average": true,
  }

  ulbs: any = [];
  hasNonBucketUlb = false;
  bucketShortName!: string;

  constructor(
    private matDialog: MatDialog,
    private fiscalRankingService: FiscalRankingService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ulb'].currentValue && this.ulbs.length == 0) {
      this.ulbs = [{ ...this.ulb, disabled: true }, ...this.topUlbs];
      this.bucketShortName = getPopulationCategory(this.ulb?.population)?.shortName;
      this.getBarchartData();
    }
  }

  getBarchartData() {
    const ulbQuery = this.ulbs.map((item: { ulb: any; }) => `ulb[]=${item?.ulb}`).join('&');
    this.fiscalRankingService.getBarchartData(ulbQuery).subscribe((res: any) => {
      this.allTypeGraphData = res.graphData;
      this.createChart();
    })
  }

  get graphData() {
    return this.allTypeGraphData?.[this.type];
  }

  get suggestedMinMax() {
    return this.types?.find(type => type.id == this.type)?.maxScore;
  }

  getBarBackgroundColor(item: any) {
    if (item.type != 'bar') return item?.backgroundColor;
    const colors = this.ulbs.map((ulb: { populationBucket: any; }) => {
      return ulb?.populationBucket == this.ulb?.populationBucket ? item?.backgroundColor : 'red'
    });
    return colors;
  }

  createChart() {
    if (this.chart) this.chart.destroy();
    console.log('ulbs', this.ulbs);
    this.hasNonBucketUlb = this.ulbs.some((ulb: { populationBucket: any; }) => ulb?.populationBucket != this.ulb?.populationBucket);
    const that = this;
    this.chart = new Chart("bar-chart-with-line", {
      type: 'bar',
      data: {
        ...this.graphData,
        datasets: this.graphData.datasets.map((item: any) => ({
          ...item,
          backgroundColor: this.getBarBackgroundColor(item),
          hidden: !(this.datasetsFilter[item.label] != undefined ? this.datasetsFilter[item.label] : true)
        })),
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin: this.suggestedMinMax,
              suggestedMax: this.suggestedMinMax,
              beginAtZero: true,
              stepSize: 100
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            }
          }],
        },
        legend: {
          position: 'bottom',
          display: true,
          labels: {
            boxWidth: 10
          },
          // onClick: function (event: any, legendItem: any) {
          //   if (Object.keys(that.datasetsFilter).includes(legendItem.text)) {
          //     that.datasetsFilter[legendItem.text] = legendItem?.hidden;
          //   }
          //   Chart.defaults.plugins.legend.onClick.call(this, event, legendItem, );
          // }
        }
      }
    } as any);

    this.chart.canvas.style.height = '55vh';
  }

  openFilter() {
    this.matDialog.open(ComparisionFiltersComponent, {
      width: '500px',
      data: {
        ulbs: this.ulbs,
        ulb: this.ulb,
        bucketShortName: this.bucketShortName,
        datasetsFilter: this.datasetsFilter
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        if (res == 'reset') return this.reset();
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
      "State Average": true,
      "National Average": true,
      "Population Average": true,
    };
    this.getBarchartData();
  }

  // chartdata: any[] = []
  // labeldata: number[] = [];
  // realdata: number[] = [];
  // colordata: string[] = [];

  // loadchartdata() {
  //   this.fiscalRankingService.loadsalesdata().subscribe(item => {
  //     this.chartdata = item;
  //     if (this.chartdata != null) {
  //       this.chartdata.map(o => {
  //         this.labeldata.push(o.year);
  //         this.realdata.push(o.amount);
  //         this.colordata.push(o.colorcode)
  //       })
  //       this.Renderbarchart(this.labeldata, this.realdata, this.colordata);
  //       // this.Renderpiechart(this.labeldata, this.realdata, this.colordata);
  //       // this.Renderdoughnutchart(this.labeldata, this.realdata, this.colordata);
  //       // this.RenderPAchart(this.labeldata, this.realdata, this.colordata);
  //       // this.RenderRadarchart(this.labeldata, this.realdata, this.colordata);
  //       // this.Renderlinechart(this.labeldata, this.realdata, this.colordata);
  //       // this.RenderBubblechart();
  //       // this.RenderScatterchart();
  //     }
  //   });
  // }

  // Renderbarchart(labeldata: any, valuedata: any, colordata: any) {
  //   this.Renderchart(labeldata, valuedata, colordata, 'barchart', 'bar')
  // }

  // Renderchart(labeldata: any, valuedata: any, colordata: any, chartid: string, charttype: any) {
  //   const mychar = new Chart(chartid, {
  //     type: charttype,
  //     data: {
  //       labels: labeldata,
  //       datasets: [
  //         {
  //           label: 'Yearly sales',
  //           data: valuedata,
  //           backgroundColor: colordata,

  //         }
  //       ]
  //     },
  //     options: {
  //       scales: {
  //         y: {
  //           beginAtZero: false
  //         }
  //       }
  //     }

  //   });
  // }
}
