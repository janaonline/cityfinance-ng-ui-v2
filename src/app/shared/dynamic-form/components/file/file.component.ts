import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { HttpEventType } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import swal from 'sweetalert';
import { FileService } from './file.service';
import { FieldConfig } from '../../field.interface';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [MaterialModule,],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss'
})
export class FileComponent {

  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;

  // uploadFolderName!: string;

  get uploadFolderName() {
    // const years = JSON.parse(localStorage.getItem("Years"));
    // const year = this.getKeyByValue(years, this.design_year);
    // return `${this.userData?.role}/${year}/sfc/${this.userData?.stateCode}`
    return `ulb/year/audited/ulbCode`
  }

  constructor(private fileService: FileService) {

  }

  ngOnInit() {
    console.log('----field file --', this.field.key);
    console.log('----group file --', this.group);
    // this.group?.get(this.field.key)?.patchValue({ uploading: false, name: 'fgh', url: '' });
    // console.log('----group file -pat-', this.group.get(this.field.key));
  }

  get getControl() {
    return this.group.get(this.field.key);
  }
  // uploadFile(event: Event, control: FormControl, reset: boolean = false, allowedFileTypes = []) {
  uploadFile(event: Event, reset: boolean = false, allowedFileTypes = []) {
    // console.log({ event, control })
    // console.log({ event })
    // if (reset) return control.patchValue({ uploading: false, name: '', url: '' });
    const maxFileSize = 15;

    const files: FileList | null = (<HTMLInputElement>event.target).files;
    if (!files) return;
    const file: File = files[0];
    let isfileValid = this.fileService.checkSpcialCharInFileName(files);
    if (isfileValid == false) {
      swal("Error", "File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
      return;
    }
    const fileExtension: any = file.name.split('.').pop();
    //TODO: check later
    // if (!allowedFileTypes.includes(fileExtension)) return swal("Error", `Allowed file extensions: ${allowedFileTypes?.join(', ')}`, "error");

    if ((file.size / 1024 / 1024) > maxFileSize) return swal("File Limit Error", `Maximum ${maxFileSize} mb file can be allowed.`, "error");

    // control.patchValue({ uploading: true });
    this.field.uploading = true;
    this.fileService.newGetURLForFileUpload(file.name, file.type, this.uploadFolderName).subscribe({
      next: (s3Response: any) => {
        const { url, path } = s3Response.data[0];
        this.fileService.newUploadFileToS3(file, url).subscribe(res => {
          if (res.type !== HttpEventType.Response) return;
          // control.patchValue({ uploading: false, name: file.name, url: path });
          this.field.uploading = false;
          const fileData: any = { name: file.name, url: path };
          this.group.get(this.field.key)?.patchValue({ file: fileData });
        });
      }, error: err => console.log(err)
    });
    return;
  }

}
