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
  ulbName: string = '';
  censusCode: string = '';
  sbCode: string = '';
  ulbId: string = '';

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) {
      this.ulbName = this.data.ulbName;
      this.censusCode = this.data.censusCode;
      this.sbCode = this.data.sbCode;
      this.ulbId = this.data.ulbId;
    }
  }

  public downloadPdf() {
    if (this.ulbId)
      window.open(`ulb-donwload/${this.ulbId}`);
    else
      throw new Error('Error in downloadPdf(): ulbId not found.');
  }

}
