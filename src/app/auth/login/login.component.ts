import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private titleService: Title, private metaService: Meta) {
    this.titleService.setTitle('Login | City Finance');

    this.metaService.updateTag({
      name: 'description',
      content: 'Login to your City Finance account to access finance commission data.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'City Finance login, user account, secure login, financial dashboard access, grants, xvifc, xvfc, cfr'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'noindex, nofollow'  // Login pages are usually not indexed
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'Login | City Finance'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Access your City Finance account to view financial data and services tailored for you.'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://cityfinance.in/login'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });
  }
}
