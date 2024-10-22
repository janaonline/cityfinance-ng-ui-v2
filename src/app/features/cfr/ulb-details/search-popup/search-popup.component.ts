import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';
import { FiscalRankingService } from '../../services/fiscal-ranking.service';
import { RouterModule } from '@angular/router';
// import { FiscalRankingService } from '../../fiscal-ranking.service';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.scss'],
  standalone: true,
  imports: [MaterialModule, RouterModule],
})
export class SearchPopupComponent {

  ulbs: any = [];
  query: string = '';

  constructor(
    private matDialog: MatDialog,
    private fiscalRankingService: FiscalRankingService
  ) { }

  search() {
    this.fiscalRankingService.searchUlb(this.query).subscribe((res: any) => {
      this.ulbs = res?.ulbs;
    })
  }
  close() {
    this.matDialog.closeAll();
  }

}
