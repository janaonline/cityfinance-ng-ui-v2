import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

@Component({
    selector: 'app-guidelines-popup',
    templateUrl: './guidelines-popup.component.html',
    styleUrls: ['./guidelines-popup.component.scss'],
    imports: [CommonModule, MaterialModule]
})
export class GuidelinesPopupComponent {
  constructor(private matDialog: MatDialog) {}

  openPdf() {
    window.open(
      'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/FiscalRanking/City_Finance_Rankings_2022_Final_Guidelines_March_2023_85825255-1ad9-4f9f-a44c-044210682c7b.pdf',
      '_blank',
    );
  }
  close() {
    this.matDialog.closeAll();
  }
}
