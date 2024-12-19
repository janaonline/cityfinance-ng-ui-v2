import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UtilityService } from '../../../core/services/utility.service';
import { UserInfoDialogComponent } from './user-info-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DownloadUserInfoService {

  // Keep track of userInfo data save status
  isUserDataSave: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    public utilityService: UtilityService,
  ) { }

  public getUserInfoQuestions() {
    return this.http.get(environment.api.url + 'file-download-log/userInfo');
  }

  public userInfoDialog(downloadInfo: any): void {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      const userData = { ...JSON.parse(userInfo), ...downloadInfo };
      this.updateDownloadUserInfoToDb(userData)
    } else {
      const dialogRef = this.dialog.open(UserInfoDialogComponent, { data: { downloadInfo } });

      dialogRef.afterClosed().subscribe((data) => {
        if (data) this.updateDownloadUserInfoToDb(data);
      });
    }

  }

  private updateDownloadUserInfoToDb(params: any): any {
    return this.http.post(environment.api.url + 'file-download-log/userInfo', params).subscribe({
      next: (res: any) => { this.isUserDataSave.next(true); },
      error: (err) => {
        this.utilityService.swalPopup('Validation Failed!', 'Failed to download file!', 'error');
        console.error(err);
      },
    });
  }
}
