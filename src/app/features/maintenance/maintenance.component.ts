import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-maintenance',
    imports: [CommonModule],
    templateUrl: './maintenance.component.html',
    styleUrl: './maintenance.component.scss'
})
export class MaintenanceComponent {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // this.getQueryParams();
  }

  getQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      console.log('params', params);
      if (params['token']) {
        localStorage.setItem('id_token', JSON.stringify(params['token']));
      }
      if (params['ulb']) {
        const userData: any = { ulb: params['ulb'] };
        localStorage.setItem('userData', userData);
      }
    });
  }
}
