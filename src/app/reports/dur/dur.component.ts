import { Component } from '@angular/core';
import { stateUlbs } from './data/stateUlb';

@Component({
  selector: 'app-dur',
  standalone: true,
  imports: [],
  templateUrl: './dur.component.html',
  styleUrl: './dur.component.scss'
})
export class DurComponent {

  ngOnInit(): void {
    this.downloadDur();
  }

  downloadDur() {
    // for 2022-23
    stateUlbs.slice(0, 1).forEach(ulb => {
      const baseUrl = 'http://localhost:4200/';
      window.open(baseUrl + `/ulbform2223/utilisation-report/${ulb.ulbId}?ulbName=${ulb.ulbName}&ulbCode=${ulb.ulbCode}&stateName=${ulb.stateName}&status=${ulb?.formStatus}`, '_blank')
    });

    // for 2023-24
    // ulbs_data_TN.slice(635, 660).forEach(ulb => {
    //   window.open(`/ulb-form/utilisation-report/${ulb.ulbId}?ulbName=${ulb.ulbName}&ulbCode=${ulb.ulbCode}&stateName=${ulb.stateName}&status=${ulb?.formStatus}`, '_blank')
    // });
  }

}
