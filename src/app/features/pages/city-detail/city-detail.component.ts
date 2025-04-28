import { Component } from '@angular/core';
import { CityHeaderComponent } from './city-header/city-header.component';
import { CityTabsComponent } from './city-tabs/city-tabs.component';

@Component({
  selector: 'app-city-detail',
  standalone: true,
  imports: [CityHeaderComponent, CityTabsComponent],
  templateUrl: './city-detail.component.html',
  styleUrl: './city-detail.component.scss'
})
export class CityDetailComponent {

}
