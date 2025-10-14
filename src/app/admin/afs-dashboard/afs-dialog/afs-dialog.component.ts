import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-afs-dialog',
  imports: [],
  templateUrl: './afs-dialog.component.html',
  styleUrl: './afs-dialog.component.scss'
})
export class AfsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    console.log("data from parent", this.data)
  }
}
