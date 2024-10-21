import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DownloadPopupComponent } from './download-popup/download-popup.component';
import { ToStorageUrlPipe } from '../../../core/pipes/to-storage-url.pipe';
import { CommonModule } from '@angular/common';
import { FiscalRankingService } from '../services/fiscal-ranking.service';
import { HeaderComponent } from './header/header.component';
import { VideosPopupComponent } from './videos-popup/videos-popup.component';
import { GuidelinesPopupComponent } from './guidelines-popup/guidelines-popup.component';
import { UnionMinistorComponent } from './union-ministor/union-ministor.component';
import { ScrollToTopComponent } from '../../../shared/components/scroll-to-top/scroll-to-top.component';
import { FooterComponent } from './footer/footer.component';
import { RankingCategoriesComponent } from './ranking-categories/ranking-categories.component';
import { AssessmentParametersComponent } from './assessment-parameters/assessment-parameters.component';
import { UlbsInIndiaComponent } from './ulbs-in-india/ulbs-in-india.component';

@Component({
  selector: 'app-cfr-home',
  standalone: true,
  imports: [CommonModule, ToStorageUrlPipe, HeaderComponent, UnionMinistorComponent,
    VideosPopupComponent, ScrollToTopComponent, FooterComponent, RankingCategoriesComponent, AssessmentParametersComponent,
    UlbsInIndiaComponent],
  templateUrl: './cfr-home.component.html',
  styleUrl: './cfr-home.component.scss'
})
export class CfrHomeComponent implements OnInit {

  data: any;


  constructor(
    private fiscalRankingService: FiscalRankingService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();
    if (sessionStorage.getItem('homeVideoAutoOpen') != 'true') {
      this.videosPopup();
      sessionStorage.setItem('homeVideoAutoOpen', 'true');
    }
  }

  loadData() {
    this.fiscalRankingService.dashboard().subscribe(({ data }: any) => {
      this.data = data;
      // const topCategoryUlbLength = Math.max(...Object.values(this.data.bucketWiseUlb).map((item: any[]) => item.length))
      const topCategoryUlbLength = 4;
      const columns = [
        {
          "label": "4M+",
          "key": "populationBucket1"
        },
        {
          "label": "1M-4M",
          "key": "populationBucket2"
        },
        {
          "label": "100K-1M",
          "key": "populationBucket3"
        },
        {
          "label": "<100K",
          "key": "populationBucket4"
        }
      ];
      this.data['topCategoryUlb'] = {
        "columns": columns,
        "data": Array.from({ length: topCategoryUlbLength }).map((_, index) => (
          columns.reduce((obj, column) => ({
            ...obj,
            [column.key]: this.data?.bucketWiseUlb?.[column.key]?.[index]?.name
          }), {})
        ))
      };
    });
  }

  guidelinesPopup() {
    this.matDialog.open(GuidelinesPopupComponent, {
      width: '450px',
      maxHeight: '90vh'
    });
  }

  videosPopup() {
    this.matDialog.open(VideosPopupComponent, {
      width: '800px'
    });
  }
}
