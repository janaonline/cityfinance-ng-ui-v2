import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CityHeaderComponent } from './city-header/city-header.component';
import { CityTabsComponent } from './city-tabs/city-tabs.component';
import { BreadcrumbComponent, BreadcrumbLink } from '../../cfr/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-city-detail',
  standalone: true,
  imports: [CityHeaderComponent, CityTabsComponent, BreadcrumbComponent],
  templateUrl: './city-detail.component.html',
  styleUrl: './city-detail.component.scss',
})
export class CityDetailComponent implements OnInit, OnChanges {
  breadcrumbLinks: BreadcrumbLink[] = [
    { label: 'Home', url: '/cfr/home' },
    { label: `ULB Details`, url: '', class: 'disabled' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
