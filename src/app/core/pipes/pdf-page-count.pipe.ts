import { Pipe, PipeTransform } from '@angular/core';
import { PDFDocument } from 'pdf-lib';
import { firstValueFrom, map, of } from 'rxjs';

@Pipe({
    name: 'pdfPageCount',
    // Ensure the pipe can handle async operations in a standalone component
    standalone: true,
})
export class PdfPageCountPipe implements PipeTransform {

    // The transform method now returns a Promise resolving to a number
    async transform(s3Url: string | null): Promise<number | string> {
        if (!s3Url) {
            return 'N/A';
        }

        try {
            // Fetch the PDF from the S3 URL (ensure CORS is configured on your S3 bucket)
            const response = await firstValueFrom(
                // Use Angular's HttpClient for consistency, or standard fetch
                // For standard fetch, just use: fetch(s3Url)
                of(fetch(s3Url)).pipe(
                    map(res => res.then(r => r.arrayBuffer()))
                )
            );

            const arrayBuffer = await response;

            // Load the PDF document using pdf-lib
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Get the number of pages
            return pdfDoc.getPageCount();

        } catch (error) {
            console.error('Error fetching or processing PDF:', error);
            // Return an error indicator or handle as needed
            return 'Error';
        }
    }
}
