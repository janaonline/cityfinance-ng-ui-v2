import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-maintenance',
  imports: [],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss'
})
export class MaintenanceComponent implements OnInit {
  constructor(private route: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Maintenance Page | City Finance');

    this.metaService.updateTag({
      name: 'description',
      content: 'City Finance maintenance page. We are currently performing scheduled maintenance. Please check back soon for updates and services.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'City Finance, maintenance, scheduled maintenance, finance updates, service unavailable'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'noindex, nofollow'
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'Maintenance Page | City Finance'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Our services are temporarily unavailable due to scheduled maintenance. We appreciate your patience at City Finance.'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://cityfinance.in/maintenance'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });

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
