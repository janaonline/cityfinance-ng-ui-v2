
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { ScrollToTopComponent } from '../../../shared/components/scroll-to-top/scroll-to-top.component';
import { FiscalRankingService } from '../services/fiscal-ranking.service';
import { AssessmentParametersComponent } from './assessment-parameters/assessment-parameters.component';
import { FooterComponent } from './footer/footer.component';
import { GuidelinesBrochureVideoComponent } from './guidelines-brochure-video/guidelines-brochure-video.component';
import { GuidelinesPopupComponent } from './guidelines-popup/guidelines-popup.component';
import { HeaderComponent } from './header/header.component';
import { RankingCategoriesComponent } from './ranking-categories/ranking-categories.component';
// import { UlbsInIndiaComponent } from './ulbs-in-india/ulbs-in-india.component';
import { VideosPopupComponent } from './videos-popup/videos-popup.component';

@Component({
  selector: 'app-cfr-home',
  imports: [HeaderComponent, ScrollToTopComponent, FooterComponent, RankingCategoriesComponent, AssessmentParametersComponent,
    // UlbsInIndiaComponent,
    GuidelinesBrochureVideoComponent, PreLoaderComponent],
  templateUrl: './cfr-home.component.html',
  styleUrl: './cfr-home.component.scss'
})
export class CfrHomeComponent implements OnInit {

  data: any;
  isLoadingData: boolean = false;


  constructor(
    private fiscalRankingService: FiscalRankingService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();
    // if (sessionStorage.getItem('homeVideoAutoOpen') != 'true') {
    //   sessionStorage.setItem('homeVideoAutoOpen', 'true');
    // }
  }

  loadData() {
    this.isLoadingData = true;
    this.fiscalRankingService.dashboard().subscribe(({ data }: any) => {
      this.data = data;
      this.isLoadingData = false;
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
