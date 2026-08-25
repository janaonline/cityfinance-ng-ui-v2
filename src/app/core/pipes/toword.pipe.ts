import { Pipe, PipeTransform } from '@angular/core';
import { ToWords } from 'to-words';

@Pipe({
  name: 'toword',
  standalone: true,
})
export class TowordPipe implements PipeTransform {
  /** Defaults to `en-IN` (Indian numbering — crore/lakh), and includes the "Rupees" suffix without
   *  the "Only" that `to-words` would otherwise append. */
  transform(value: number): string {
    if (!value) return '';
    return new ToWords().convert(Number(value), {
      currency: true,
      doNotAddOnly: true,
    });
  }
}
