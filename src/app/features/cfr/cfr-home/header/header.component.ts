import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material.module';

interface Card {
  cardKey: number;
  cardUrl: string;
  cardValueNo: number;
  cardLabel: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
})
export class HeaderComponent implements OnInit {
  @Input() rankedUlbCount: number = 0;
  data: Card[] = [];

  constructor() { }

  ngOnInit(): void {
    this.data = [
      {
        cardKey: 0,
        cardUrl: './assets/fiscal-rankings/ulb-ranked.png',
        cardValueNo: this.rankedUlbCount,
        cardLabel: 'ULBs Ranked',
      },
      {
        cardKey: 1,
        cardUrl: './assets/fiscal-rankings/ranking-param.png',
        cardValueNo: 3,
        cardLabel: 'Ranking Parameters',
      },
      {
        cardKey: 2,
        cardUrl: './assets/fiscal-rankings/indicators.png',
        cardValueNo: 15,
        cardLabel: 'Key Indicators',
      },
      {
        cardKey: 3,
        cardUrl: './assets/fiscal-rankings/population.png',
        cardValueNo: 4,
        cardLabel: 'Population Categories',
      },
    ];
  }

  // get getRatio() {
  //   const ZOOM: number = 0.001152073732718894;
  //   const zoomValue = window.innerHeight * ZOOM;
  //   return window.innerWidth < 992 ? 1 : zoomValue;
  // }

  scrollOnePageDown() {
    const viewportHeight = window.innerHeight;
    window.scrollBy(0, viewportHeight - 150);
  }
}
