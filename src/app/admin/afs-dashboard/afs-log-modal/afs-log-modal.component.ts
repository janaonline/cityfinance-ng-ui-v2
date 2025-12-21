import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AfsService } from '../afs.service';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';

export interface DialogData {
  requestId: string;
}

@Component({
  selector: 'app-afs-log-modal',
  imports: [MatDialogModule, MatButtonModule, NgClass, DatePipe, DecimalPipe],
  templateUrl: './afs-log-modal.component.html',
  styleUrl: './afs-log-modal.component.scss'
})
export class AfsLogModalComponent implements OnInit {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly afsService = inject(AfsService);

  logsData: any;

  // constructor() {
  //   console.log('Request ID in dialog:', this.data);
  // }

  ngOnInit(): void {
    this.fetchLog();
  }

  fetchLog() {
    this.afsService.getRequestLog(this.data.requestId).subscribe((response) => {
      this.logsData = response.data;
    });
  }

}
