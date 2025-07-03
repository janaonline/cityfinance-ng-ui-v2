import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { AfsPopupData } from '../../../core/models/interfaces';
import { UtilityService } from '../../../core/services/utility.service';
import { DownloadUserInfoService } from '../user-info-dialog/download-user-info.service';
import { NoDataFoundComponent } from '../shared-ui/no-data-found.component';

@Component({
  selector: 'app-afs-pdfs-dialog',
  imports: [NoDataFoundComponent],
  templateUrl: './afs-pdfs-dialog.component.html',
  styleUrl: './afs-pdfs-dialog.component.scss',
})
export class AfsPdfsDialogComponent {
  //TODO: add user info component
  reports!: AfsPopupData;
  fileType: string = '';

  constructor(
    public dialogRef: MatDialogRef<AfsPdfsDialogComponent>,
    private userInfoService: DownloadUserInfoService,
    private utilityService: UtilityService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { reportList: AfsPopupData; fileType: string },
  ) {
    this.reports = data?.reportList;
    this.fileType = data?.fileType;
  }

  public openFile(fileInfo: { url: string; name: string }): void {
    // console.log('openFile function called')
    const target_file_url = environment.STORAGE_BASEURL + fileInfo['url'];

    if (this.fileType === 'pdf') window.open(target_file_url, '_blank');
    else if (this.fileType === 'excel')
      this.utilityService.fetchFile(target_file_url, fileInfo['name']);

    return;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
