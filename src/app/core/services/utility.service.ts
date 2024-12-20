import { Injectable } from '@angular/core';
import FileSaver from 'file-saver';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: "root"
})
export class UtilityService {
  http: any;
  constructor() { }

  public fetchFile(target_file_url: string, fileName: string): void {
    // Show a popup to indicate that the file is being downloaded
    const swalInstance = this.swalLoader();

    fetch(target_file_url)
      .then((response) => {
        if (!response.ok) { throw new Error("Response was not ok.") }
        return response.blob();
      })
      .then((blob) => {
        FileSaver.saveAs(blob, fileName);
        swalInstance.close(); // Close the "Downloading..." popup
        this.swalPopup('File Downloaded', 'File has been downloaded successfully!', 'success');
      })
      .catch((error) => {
        console.error("Error in fetching file: ", error);
        swalInstance.close(); // Close the "Downloading..." popup
        this.swalPopup('Validation Failed!', 'Failed to download file!', 'error');
      });
  }

  public swalPopup(title: string, text: string, icon: any = 'success'): void {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      showConfirmButton: false,
      timer: 2000
    });
  }

  public swalLoader(): any {
    return Swal.fire({
      title: 'Downloading...',
      text: 'Please wait while the file is being downloaded.',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      timerProgressBar: true,
      timer: 0 // No timer here, we'll control when to close the popup manually
    });
  }
}
