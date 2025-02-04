import { Component } from '@angular/core';

interface Card {
  cardImgUrl: string;
  cardLabel: string;
  altTxt: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
})
export class FooterComponent {
  data: Card[] = [];

  constructor() { }

  ngOnInit(): void {
    this.data = [
      {
        cardImgUrl: './assets/fiscal-rankings/partner-janaagrah.png',
        cardLabel: 'Knowledge Partner',
        altTxt: 'Janaagraha',
      },
      {
        cardImgUrl: './assets/fiscal-rankings/partner-ministry.png',
        cardLabel: 'An Initiative by',
        altTxt: 'Ministry of housing and urban affairs',
      },
      {
        cardImgUrl: './assets/fiscal-rankings/partner-quality-council.png',
        cardLabel: 'Project Monitoring Unit (PMU)',
        altTxt: 'Quality council of India',
      },
    ];
  }
}
