import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable, map } from 'rxjs';
import { S3FileURLResponse } from '../../../../core/models/s3Responses/fileURLResponse';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient,) { }

  newGetURLForFileUpload(fileName: File["name"], fileType: File["type"], folderName?: string) {
    const headers = new HttpHeaders();
    // for s3 endpoints == getS3Url
    // for auzure endpoints == getS3Url

    return this.http.post<S3FileURLResponse>(
      `${environment.api.url}/get${environment?.storageType}`,
      JSON.stringify([
        {
          folder: folderName,
          file_name: fileName,
          mime_type: fileType,
        },
      ]),
      { headers }
    );
    // .pipe(map((response) => this.changeKeys(response['data'][0])));
  }
  changeKeys(el: any) {
    let formattedObj = {
      data: [
        {
          file_url: el?.file_alias,
          url: el?.url,
          file_name: el?.file_name,
          host: el?.host,
          mime_type: el?.mime_type
        }
      ]
    }
    return formattedObj;

  }
  // uploadFileToS3(
  //   file: File,
  //   s3URL: string,
  //   options = { reportProgress: true }
  // ) {
  //   return this.http.put(s3URL, file, {
  //     reportProgress: options.reportProgress,
  //     observe: "events",
  //   });
  // }
  uploadFileToS3(file: File, s3URL: string, options = { reportProgress: true }): Observable<any> {
    // Create headers
    // const token = JSON.parse(localStorage.getItem("id_token"));
    // const sessionID = sessionStorage.getItem("sessionID");
    const headers = new HttpHeaders({
      'X-Ms-Blob-Type': 'BlockBlob',
      // "Content-Type" : "application/json",
      // "sessionId" : sessionID,
      // "x-access-token" : token
      // Add more headers as needed
    });

    // Make the PUT request with headers
    return this.http.put(s3URL, file, {
      reportProgress: options.reportProgress,
      observe: 'events',
      headers: s3URL.includes('blob.core.windows.net') ? headers : {}, // Include the headers here for auzure
    });
  }




  /**
   *
   * @param alias Here fileAlias is the file_alias key that is returned from getting s3URL api call.
   */
  sendUploadFileForProcessing(alias: string, financialYear: string = "", path?: string) {
    return this.http.post(`${environment.api.url}/processData`, {
      alias: path,
      financialYear,
    });
  }

  getFileProcessingStatus(
    fileId: string
  ): Observable<{ message: string; completed: boolean; status: "FAILED" }> {
    // IMPORTANT Comment this and uncomment below line. Some changes may be required there...
    // return of({
    //   status: Math.random() > 0.5,
    //   message: "somethin sometinh"
    // }).pipe(delay(2000));

    return this.http
      .get(`${environment.api.url}/getProcessStatus/${fileId}`)
      .pipe(map((response: any) => ({ ...response["data"] })));
  }

  newUploadFileToS3(
    file: File,
    s3URL: string,
    options = { reportProgress: true }
  ) {
    const headers = new HttpHeaders({
      'X-Ms-Blob-Type': 'BlockBlob',
    });
    return this.http.put(s3URL, file, {
      reportProgress: options.reportProgress,
      observe: "events",
      headers: s3URL.includes('blob.core.windows.net') ? headers : {}
    });
  }
  checkSpcialCharInFileName(file: File) {
    let name = ((file.name).split('.'))[0];
    let iChars = "~`!#$%^&*+=[]\\\';,/{}|\":<>?@";
    for (let i = 0; i < name.length; i++) {
      if (iChars.indexOf(name.charAt(i)) != -1) {
        return false;
      }
    }
    return true;
  }

  downloadFileFromBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);;
  }
}
