import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-ulb-details-header',
  templateUrl: './ulb-details-header.component.html',
  styleUrls: ['./ulb-details-header.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class UlbDetailsHeaderComponent implements OnChanges {
  @Input() data: any;
  ulb: any;

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) this.updateInputDataDependencies();
  }

  private updateInputDataDependencies() {
    this.ulb = this.data?.ulb;
  }

  public downloadPdf() {
    window.open(`ulb-donwload/${this.ulb.ulb}`);
  }

}
