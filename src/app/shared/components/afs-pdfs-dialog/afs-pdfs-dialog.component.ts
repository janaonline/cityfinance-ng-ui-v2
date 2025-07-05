import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { AfsPopupData, UserInfoData, UserInfoUlbDetails } from '../../../core/models/interfaces';
import { UtilityService } from '../../../core/services/utility.service';
import { NoDataFoundComponent } from '../shared-ui/no-data-found.component';
import { DownloadUserInfoService } from '../user-info-dialog/download-user-info.service';

@Component({
  selector: 'app-afs-pdfs-dialog',
  imports: [NoDataFoundComponent],
  templateUrl: './afs-pdfs-dialog.component.html',
  styleUrl: './afs-pdfs-dialog.component.scss',
})
export class AfsPdfsDialogComponent {
  // this.openDialog2(res["data"], type, { fileName: 'abc_audited_2023-24', type: 'pdf', module: 'resources' });
  reports!: AfsPopupData;
  fileType: string = '';
  ulbDetails!: UserInfoUlbDetails;
  USER_INFO_POPUP_MODULES = ['resources', 'cityPage'];

  constructor(
    public dialogRef: MatDialogRef<AfsPdfsDialogComponent>,
    private userInfoService: DownloadUserInfoService,
    private utilityService: UtilityService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserInfoData,
  ) {
    console.log('userInfo: ', this.reports, this.fileType, this.ulbDetails);
    this.reports = data?.reportList;
    this.fileType = data?.fileType;
    this.ulbDetails = data?.ulbDetails;
  }

  public openFile(fileInfo: { url: string; name: string }): void {
    const target_file_url = environment.STORAGE_BASEURL + fileInfo['url'];

    // User info popup.
    if (this.ulbDetails && this.USER_INFO_POPUP_MODULES.includes(this.ulbDetails['module'])) {
      const fileName = `${this.ulbDetails['fileName']}_${this.ulbDetails['type']}_${fileInfo['name']}.${this.fileType}`;

      this.userInfoService
        .openUserInfoDialog([{ fileName }], this.ulbDetails['module'])
        .then((isDialogConfirmed) => {
          if (isDialogConfirmed) {
            if (this.fileType === 'pdf') window.open(target_file_url, '_blank');
            if (this.fileType === 'excel')
              this.utilityService.fetchFile(target_file_url, fileInfo['name']);
          }
          return;
        });
    } else {
      if (this.fileType === 'pdf') window.open(target_file_url, '_blank');
      if (this.fileType === 'excel')
        this.utilityService.fetchFile(target_file_url, fileInfo['name']);
    }

    return;
  }
  // public openFile(fileInfo: { url: string; name: string }): void {
  //   // console.log('openFile function called')
  //   const target_file_url = environment.STORAGE_BASEURL + fileInfo['url'];

  //   if (this.fileType === 'pdf') window.open(target_file_url, '_blank');
  //   else if (this.fileType === 'excel')
  //     this.utilityService.fetchFile(target_file_url, fileInfo['name']);

  //   return;
  // }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
