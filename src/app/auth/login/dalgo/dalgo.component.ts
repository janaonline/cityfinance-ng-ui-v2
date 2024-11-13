import { Component, OnInit } from '@angular/core';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { of } from 'rxjs';
import { SupersetService } from './superset.service';
// import { SupersetService } from 'src/app/pages/mohuaform/mohua-dashboard/superset.service';

@Component({
  selector: 'app-dalgo',
  templateUrl: './dalgo.component.html',
  styleUrls: ['./dalgo.component.scss']
})
export class DalgoComponent implements OnInit {

  constructor(
    private supersetService: SupersetService
  ) { }

  ngOnInit(): void {
    this.loadEmbeddedDashboard();
  }

  private loadEmbeddedDashboard() {
    const dashboardUuid = '6476518a-7dfd-4614-87c2-8a315c9ece25';   // MoHUA dashboard UUID

    // Define the fetchGuestToken function that calls our Angular service
    const fetchGuestTokenFromBackend = () => {
      const token1 = this.supersetService.getGuestToken({}).toPromise();
      return token1;
    };

    embedDashboard({
      id: dashboardUuid,
      supersetDomain: 'https://janaagraha.dalgo.in/',
      mountPoint: document.getElementById('mohua-superset-container') as HTMLElement,
      fetchGuestToken: fetchGuestTokenFromBackend, // Use the method we defined above

      dashboardUiConfig: {
        hideTitle: true,
        filters: {
          expanded: true
        },
        urlParams: {
          foo: 'value1',
          bar: 'value2'
        }
      },
      iframeSandboxExtras: ['allow-top-navigation', 'allow-popups-to-escape-sandbox']

    });
  }

}
