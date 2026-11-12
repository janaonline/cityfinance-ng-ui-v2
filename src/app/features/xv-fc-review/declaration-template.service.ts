import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const TEMPLATE_ASSET_PATH = 'assets/templates/declaration-template.docx';
const TEMPLATE_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * Fills in and downloads the fillable Declaration Word template (`{ulbName}` is the only
 * dynamic field) - shared between AFS and Ptax since both need the same document. The City
 * user fills in the financial year/name/designation/date, adds their seal and signature, then
 * uploads the signed document back - as a PDF, since the declaration upload only accepts PDF.
 */
@Injectable({ providedIn: 'root' })
export class DeclarationTemplateService {
  private readonly http = inject(HttpClient);

  async downloadDeclarationTemplate(ulbName: string | null | undefined): Promise<void> {
    const templateBuffer = await firstValueFrom(
      this.http.get(TEMPLATE_ASSET_PATH, { responseType: 'arraybuffer' }),
    );
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render({ ulbName: ulbName?.trim() || '' });
    const blob: Blob = doc.getZip().generate({ type: 'blob', mimeType: TEMPLATE_MIME_TYPE });

    const safeUlbSuffix = ulbName?.trim() ? `-${ulbName.trim().replace(/[\\/:*?"<>|]/g, '')}` : '';
    saveAs(blob, `Declaration-Template${safeUlbSuffix}.docx`);
  }
}
