import { Component, ViewChild } from '@angular/core';
import { MapComponent } from '../../../../shared/components/map/map.component';
import { ResettableMap } from '../../../../shared/components/map/interfaces';
import { GridViewComponent } from '../../../../shared/components/grid-view/grid-view.component';

@Component({
  selector: 'app-city-header',
  standalone: true,
  imports: [MapComponent, GridViewComponent],
  templateUrl: './city-header.component.html',
  styleUrl: './city-header.component.scss',
})
export class CityHeaderComponent {
  @ViewChild(MapComponent) private map!: ResettableMap;

  ulbId = '5fa2465f072dab780a6f1274';
  stateCode = 'MP';

  // If reset button is clicked.
  resetMap(): void {
    if (this.map) this.map.resetMap();
  }

  // If another ULB is clicked on map - show data for new ULB.
  onUlbChange(newUlbId: string) {
    console.log('newUlbId =', newUlbId);
    if (this.ulbId !== newUlbId) {
      console.log('Reset the city dashboard for new ulb.');
    }
  }
}
