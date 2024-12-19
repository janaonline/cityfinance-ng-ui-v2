import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { UtilityService } from '../../../core/services/utility.service';
import { InputComponent } from "../../dynamic-form/components/input/input.component";
import { DynamicFormComponent } from "../../dynamic-form/dynamic-form.component";
import { DynamicFormService } from '../../dynamic-form/dynamic-form.service';
import { FieldConfig } from '../../dynamic-form/field.interface';
import { PreLoaderComponent } from '../pre-loader/pre-loader.component';
import { DownloadUserInfoService } from './download-user-info.service';

@Component({
  selector: 'app-user-info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatInputModule, MatDivider, DynamicFormComponent, InputComponent, PreLoaderComponent],
  templateUrl: './user-info-dialog.component.html',
  styleUrl: './user-info-dialog.component.scss'
})
export class UserInfoDialogComponent {
  userInfo: FormGroup = new FormGroup({});
  fields: FieldConfig[] = [];
  isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
    public dialogRef: MatDialogRef<UserInfoDialogComponent>,
    private dynamicFormService: DynamicFormService,
    private downloadUserService: DownloadUserInfoService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    this.getFields();
  }

  getFields(): void {
    this.isLoading = true;
    this.downloadUserService.getUserInfoQuestions().subscribe((res: any) => {
      this.fields = res.data;
      this.userInfo = this.dynamicFormService.toFormGroup(this.fields);
      this.isLoading = false;
    });
  }

  submitUserInfo(): void {

    if (this.userInfo.valid) {
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo.value));
      const payload = { ...this.userInfo.value, ...this.matDialogData.downloadInfo };
      this.dialogRef.close(payload);
    } else {
      this.utilityService.swalPopup('Validation Failed!', 'Failed to download file!', 'error');
      console.error("Invalid user info.");
    }

  }

}
