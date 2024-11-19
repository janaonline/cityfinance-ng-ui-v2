import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MaterialModule } from '../../../../material.module';

interface Card {
  cardEmitValue?: EventEmitter<any>;
  cardHref: string;
  cardImgUrl: string;
  cardLabel: string;
  cardIconLabel: string;
  cardIcon: string;
}

@Component({
  selector: 'app-guidelines-brochure-video',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './guidelines-brochure-video.component.html',
  styleUrl: './guidelines-brochure-video.component.scss',
})
export class GuidelinesBrochureVideoComponent {
  @Output() onGuidelinesPopup = new EventEmitter();
  @Output() onVideosPopup = new EventEmitter();

  data: Card[] = [];

  constructor() {}

  ngOnInit(): void {
    this.data = [
      {
        cardEmitValue: this.onGuidelinesPopup,
        cardHref: '',
        cardImgUrl: './assets/fiscal-rankings/guidelines-icon.svg',
        cardLabel: 'Guidelines',
        cardIconLabel: 'Download',
        cardIcon: 'bi bi-download',
      },
      {
        cardHref:
          'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/FiscalRanking/City_Finance_Rankings_2022_Brochure_March_2023_3708f180-5be7-41ef-96c9-2d98db398575.pdf',
        cardImgUrl: './assets/fiscal-rankings/brochure-icon.svg',
        cardLabel: 'Brochure',
        cardIconLabel: 'Download',
        cardIcon: 'bi bi-download',
      },
      {
        cardEmitValue: this.onVideosPopup,
        cardHref: '',
        cardImgUrl: './assets/fiscal-rankings/video-icon.svg',
        cardLabel: 'Videos',
        cardIconLabel: 'Play video',
        cardIcon: 'bi bi-camera-reels',
      },
    ];
  }
}
