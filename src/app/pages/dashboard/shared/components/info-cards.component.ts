import { Component, input } from '@angular/core';
import { InrFormatPipe } from '../../../../core/pipes/inr-format.pipe';
import { ExploresectionTable } from '../../../home/dashboard-map-section/interfaces';

@Component({
  selector: 'app-info-cards',
  imports: [InrFormatPipe],
  template: ` <div class="row justify-content-around gap-2 flex-wrap py-3 px-2">
    @for (item of items(); track $index) {
      <div class="col border p-3 rounded-3 shadow-sm text-center card" style="min-width: 150px">
        <div class="card-data">
          <img
            class="m-2"
            [src]="item['src']"
            [alt]="item['label']"
            style="width: 2rem; height: 2rem"
          />
          <p class="m-2 fw-bold">{{ item['value'] | inrFormat: 'auto' }}</p>
          <p class="m-2 text-secondary custom-font-size-6">{{ item['label'] }}</p>
        </div>
      </div>
    }
  </div>`,
  styleUrls: [],
})
export class InfoCardsComponent {
  readonly items = input<ExploresectionTable[]>([]);
  // items1 = [
  //   {
  //     sequence: '1',
  //     label: 'Total Tax Revenue',
  //     value: 'INR 2974 Cr',
  //     info: '',
  //     src: './assets/file.svg',
  //   },
  //   {
  //     sequence: '2',
  //     label: 'Total Own Revenue',
  //     value: 'INR 3850 Cr',
  //     info: '',
  //     src: './assets/file.svg',
  //   },
  //   {
  //     sequence: '3',
  //     label: 'Total Grant',
  //     value: 'INR 1640 Cr',
  //     info: '',
  //     src: './assets/coinCuren.svg',
  //   },
  //   {
  //     sequence: '4',
  //     label: 'Total Revenue',
  //     value: 'INR 5587 Cr',
  //     info: '',
  //     src: './assets/coinCuren.svg',
  //   },
  //   {
  //     sequence: '5',
  //     label: 'Total Expenditure',
  //     value: 'INR 6465 Cr',
  //     info: '',
  //     src: './assets/coinCuren.svg',
  //   },
  //   {
  //     sequence: '6',
  //     label: 'Total Balance Sheet Size',
  //     value: 'INR 19564 Cr',
  //     info: '',
  //     src: './assets/Group 15967.svg',
  //   },
  // ];
}
