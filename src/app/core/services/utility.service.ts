import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import FileSaver from 'file-saver';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';
type SnackbarClass = 'snackbar-success' | 'snackbar-danger' | 'snackbar-warn';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(private _snackBar: MatSnackBar) {}

  public fetchFile(target_file_url: string, fileName: string): void {
    // Show a popup to indicate that the file is being downloaded
    this.swalLoader();

    fetch(target_file_url)
      .then((response) => {
        if (!response.ok) throw new Error('Response was not ok.');
        return response.blob();
      })
      .then((blob) => {
        FileSaver.saveAs(blob, fileName);
        Swal.close();
        this.swalPopup('File Downloaded', 'File has been downloaded successfully!', 'success');
      })
      .catch((error) => {
        console.error('Error in fetching file: ', error);
        Swal.close();
        this.swalPopup('Validation Failed!', 'Failed to download file!', 'error');
      });
  }

  // Helper: Trigger snack-bar.
  triggerSnackbar(msg: string, className: SnackbarClass = 'snackbar-success'): void {
    this._snackBar.open(msg, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 3000,
      panelClass: [className],
    });
  }

  public swalPopup(title: string, text: string, icon: SweetAlertIcon = 'success'): void {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  public swalLoader(): Promise<SweetAlertResult> {
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
      timer: 0, // No timer here, we'll control when to close the popup manually
    });
  }

  /**
   * @param includeTime - If true (default), returns both date and time in 'YYYY-MM-DD_HH-MM-SS' format.
   *                      If false, returns only the date in 'YYYY-MM-DD' format.
   */
  public getTimeStamp(includeTime: boolean = true): string {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const timeString = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

    if (includeTime) return `${dateString}_${timeString}`;
    return dateString;
  }

  /**
   * Formats a byte count into a human-readable size string.
   * @param bytes - File size in bytes
   * @param decimals - Number of decimal places to preserve in the formatted value
   * @returns Human-readable file size string
   */
  public formatBytes(bytes: number, decimals: number = 0): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals > 0 ? decimals : 0;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Derives a file name from a storage path when an explicit name is not available.
   * @param fileUrl - Storage path or URL containing the file name segment
   * @returns Extracted file name or an empty string when no usable segment exists
   */
  public getFileNameFromUrl(fileUrl: string | null | undefined): string {
    if (!fileUrl) {
      return '';
    }

    const pathSegment = fileUrl.split(/[?#]/)[0];
    const segments = pathSegment.split('/');
    return segments[segments.length - 1] ?? '';
  }

  /**
   * Returns a trimmed string only when it is non-empty.
   * @param value - Candidate string-like value
   * @returns Trimmed string or `null` when the value is empty or not a string
   */
  public getNonEmptyString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }
}
