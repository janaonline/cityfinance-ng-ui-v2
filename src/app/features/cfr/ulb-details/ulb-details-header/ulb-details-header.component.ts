import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { IndiaMapComponent } from '../../india-map/india-map.component';

@Component({
  selector: 'app-ulb-details-header',
  templateUrl: './ulb-details-header.component.html',
  styleUrls: ['./ulb-details-header.component.scss'],
  standalone: true,
  imports: [MaterialModule, IndiaMapComponent, LoaderComponent],
})
export class UlbDetailsHeaderComponent implements OnChanges {
  @Input() data: any;
  ulb: any;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) this.updateInputDataDependencies();
  }

  private updateInputDataDependencies() {
    this.ulb = this.data?.ulb;
  }
}
