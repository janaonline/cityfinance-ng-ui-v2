import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { DownloadUserInfoService } from '../../../../shared/components/user-info-dialog/download-user-info.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { GoogleAnalyticsService } from '../../../../core/services/google-analytics.service';

interface Card {
  cardKey: number;
  cardUrl: string;
  cardValueNo: number;
  cardLabel: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, MaterialModule, RouterModule, MatDialogModule],
})
export class HeaderComponent implements OnInit {
  @Input() rankedUlbCount: number = 0;
  data: Card[] = [];

  constructor(
    public userInfoService: DownloadUserInfoService,
    private utilityService: UtilityService,
    public gaService: GoogleAnalyticsService,
  ) {}

  ngOnInit(): void {
    this.data = [
      {
        cardKey: 0,
        cardUrl: './assets/fiscal-rankings/ulb-ranked.png',
        cardValueNo: this.rankedUlbCount,
        cardLabel: 'ULBs Ranked',
      },
      {
        cardKey: 1,
        cardUrl: './assets/fiscal-rankings/ranking-param.png',
        cardValueNo: 3,
        cardLabel: 'Ranking Parameters',
      },
      {
        cardKey: 2,
        cardUrl: './assets/fiscal-rankings/indicators.png',
        cardValueNo: 15,
        cardLabel: 'Key Indicators',
      },
      {
        cardKey: 3,
        cardUrl: './assets/fiscal-rankings/population.png',
        cardValueNo: 4,
        cardLabel: 'Population Categories',
      },
    ];
  }

  public scrollOnePageDown(): void {
    const viewportHeight = window.innerHeight;
    window.scrollBy(0, viewportHeight - 150);
  }

  public openUserInfoDialog(): void {
    // TODO: update this as per new functions.
    // this.gaService.trackEvent('Download Report button clicked', 'CFR Home Page')
    // const fileName = 'Download_CFR_Rankings_Reports.pdf';
    // const downloadInfo = { module: 'cfr', fileDownloaded: [{ fileName }] };
    // // Open the user info dialog to collect user data
    // this.userInfoService.userInfoDialog(downloadInfo);
    // // Once the user data is saved, download the file
    // this.userInfoService.isUserDataSave.pipe(take(1)).subscribe((res) => {
    //   if (res) {
    //     const url = 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/ULB/2024-25/annual_accounts/KA122/new_balance_sheet_2023-24_54532ba6-deef-48c2-a43e-e95aca94d0c2.pdf';
    //     this.utilityService.fetchFile(url, fileName);
    //   }
    // });
  }
}
