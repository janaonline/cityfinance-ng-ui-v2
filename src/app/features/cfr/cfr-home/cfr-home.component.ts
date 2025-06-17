
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
import { UlbsInIndiaComponent } from './ulbs-in-india/ulbs-in-india.component';
import { VideosPopupComponent } from './videos-popup/videos-popup.component';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-cfr-home',
  imports: [HeaderComponent, ScrollToTopComponent, FooterComponent, RankingCategoriesComponent, AssessmentParametersComponent,
    UlbsInIndiaComponent, GuidelinesBrochureVideoComponent, PreLoaderComponent],
  templateUrl: './cfr-home.component.html',
  styleUrl: './cfr-home.component.scss'
})
export class CfrHomeComponent implements OnInit {

  data: any;
  isLoadingData: boolean = false;


  constructor(
    private titleService: Title,
    private metaService: Meta,
    private fiscalRankingService: FiscalRankingService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('City Finance Ranking | City Finance');

    this.metaService.updateTag({
      name: 'description',
      content: 'City Finance Ranking Home - Explore city fiscal rankings, assessment parameters, and guidelines for urban local bodies in India.'
    });

    this.metaService.updateTag({
      name: 'keywords',
    content: 'City Finance, CFR, fiscal ranking, urban local bodies, city assessment, guidelines, India'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow'
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'City Finance | CFR Home'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Discover city fiscal rankings, assessment parameters, and guidelines for urban local bodies at City Finance CFR Home.'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://cityfinance.in/cfr/home'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });
    this.loadData();
    if (sessionStorage.getItem('homeVideoAutoOpen') != 'true') {
      // hiding video popup now
      // this.videosPopup();
      sessionStorage.setItem('homeVideoAutoOpen', 'true');
    }
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
