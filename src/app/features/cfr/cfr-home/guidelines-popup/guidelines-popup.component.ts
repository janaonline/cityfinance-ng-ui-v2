import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-guidelines-popup',
  templateUrl: './guidelines-popup.component.html',
  styleUrls: ['./guidelines-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule],
})
export class GuidelinesPopupComponent {

  constructor(
    private matDialog: MatDialog
  ) { }

  close() {
    this.matDialog.closeAll();
  }

}
