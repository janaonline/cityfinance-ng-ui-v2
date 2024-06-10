import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { HttpEventType } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import swal from 'sweetalert';
import { FileService } from './file.service';
import { FieldConfig } from '../../field.interface';
import { DndDirective } from './dnd.directive';
import { Subscription } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [MaterialModule, DndDirective, MatProgressBarModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss'
})
export class FileComponent {

  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  progress = 50;
  currentFile!: File | null;
  s3Subscribe!: Subscription;
  fileTypes: any = { 'pdf': 'application/pdf', 'xlsx': 'application/vnd.ms-excel' };
  allowedFileTypeStr: string = '';
  maxFileSize: number = 20;


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
    // console.log('----field file --', this.field);
    // console.log('----group file --', this.group);
    this.allowedFileTypeStr = this.field.allowedFileTypes?.map((e: string) => this.fileTypes[e])?.join(',') || '';
  }

  get getControl() {
    return this.group.get(this.field.key);
  }
  get getRawValue() {
    return this.group.getRawValue();
  }


  @ViewChild('fileDropRef', { static: false }) fileDropRef!: ElementRef;
  resetFileInput() {
    this.fileDropRef.nativeElement.value = null;
  }
  files: any[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  // fileBrowseHandler(files: any[]) {
  fileBrowseHandler(event: Event) {
    // console.log('event-----', event);

    const files: FileList | null = (<HTMLInputElement>event.target).files;
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile() {
    this.resetFileInput();
    this.currentFile = null;
    // this.group.reset()
    this.group.get('file')?.reset();
    // this.group.get(this.field.key)?.patchValue({ name: '', url: '' });
    if (this.s3Subscribe) this.s3Subscribe.unsubscribe();
    // console.log('this.group.123', );
    // console.log('this.group.', this.group);

  }

  /**
   * To be removed
   * Simulate the upload process
   */
  // uploadFilesSimulator(index: number) {
  //   setTimeout(() => {
  //     if (index !== 0) {
  //       return;
  //     } else {
  //       const progressInterval = setInterval(() => {
  //         if (this.progress === 100) {
  //           clearInterval(progressInterval);
  //           this.uploadFilesSimulator(index + 1);
  //         } else {
  //           this.progress += 5;
  //         }
  //       }, 200);
  //     }
  //   }, 1000);
  // }



  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: FileList | null) {
    if (!files?.length || !files[0]) return;

    this.progress = 0;
    if (!this.isValidFile(files[0])) {
      return;
    }
    this.currentFile = files[0];

    // this.uploadFilesSimulator(0);
    this.uploadFileToS3();

  }

  isValidFile(file: File): Boolean {
    if (!file) return false;

    const fileExtension: any = file.name.split('.').pop();
    if (this.field.allowedFileTypes && !this.field.allowedFileTypes?.includes(fileExtension)) {
      swal("Error", `Allowed file extensions: ${this.field.allowedFileTypes?.join(', ')}`, "error");
      return false;
    }

    if ((file.size / 1024 / 1024) > this.maxFileSize) {
      swal("File Limit Error", `Maximum ${this.maxFileSize} mb file can be allowed.`, "error");
      return false;
    }

    let isfileValid = this.fileService.checkSpcialCharInFileName(file);
    if (isfileValid == false) {
      swal("Error", "File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
      return false;
    }

    return true;
  }

  uploadFileToS3() {
    // if (reset) return control.patchValue({ uploading: false, name: '', url: '' });
    if (!this.currentFile) return;
    const file = this.currentFile;

    // control.patchValue({ uploading: true });
    this.field.uploading = true;
    this.progress = 20;
    this.fileService.newGetURLForFileUpload(file.name, file.type, this.uploadFolderName).subscribe({
      next: (s3Response: any) => {
        if (this.s3Subscribe) {
          this.s3Subscribe.unsubscribe();
        }
        const { url, path } = s3Response.data[0];
        this.progress = 80;
        this.s3Subscribe = this.fileService.newUploadFileToS3(file, url).subscribe(res => {
          if (res.type !== HttpEventType.Response) return;
          // control.patchValue({ uploading: false, name: file.name, url: path });
          this.field.uploading = false;
          this.progress = 100;
          const fileData: any = { name: file.name, url: path, size: this.formatBytes(file.size) };
          this.group.get('file')?.patchValue(fileData);
        });
      }, error: err => console.log(err)
    });
    return;
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number = 0) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
