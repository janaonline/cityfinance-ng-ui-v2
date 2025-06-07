import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  totalUsersVisit: number | undefined;
  footerLinks = [
    { href: '/home', title: 'Home' },
    { href: '/dashboard/national/61e150439ed0e8575c881028', title: 'Financial' },
    { href: '/own-revenue-dashboard', title: 'Own Revenue Performance' },
    { href: '/dashboard/slb', title: 'Service Level Benchmarks Performance' },
    { href: '/resources-dashboard/learning-center/toolkits', title: 'Resources' },
  ];
  socialMediaInfo = [
    {
      link: 'https://www.facebook.com/mohua.india',
      imgSrc: './assets/images/social/fb.svg',
      key: 'facebook-mohua',
    },
    {
      link: 'https://twitter.com/MoHUA_India',
      imgSrc: './assets/images/social/twitter.svg',
      key: 'twitter-mohua',
    },
    {
      link: 'https://www.linkedin.com/company/mohua/',
      imgSrc: './assets/images/social/linkdin.svg',
      key: 'linkedin-mohua',
    },
  ];
  address = ` Director, AMRUT <br />
    Ministry of Housing and Urban Affairs <br />
    210 C, Nirman Bhawan, Maulana Azad Road <br />
    New Delhi-110011`;
  mailId = 'mailto:contact@cityfinance.in';
  mailLabel = 'contact@cityfinance.in';

  constructor(
    private _commonService: CommonService,
    private router: Router,
  ) {
    this.getPageDetails();
  }

  ngOnInit() {
    this.fetchUserVisitCount();
  }

  private fetchUserVisitCount() {
    this._commonService.getWebsiteVisitCount().subscribe((res: number) => {
      return (this.totalUsersVisit = res);
    });
  }

  private getPageDetails() {
    this.router.events.subscribe((event) => {
      let urlArray;
      if (event instanceof NavigationEnd) {
        urlArray = event.url.split('/');
        if (urlArray.includes('rankings')) {
          this.address = `Nirman Bhawan, <br /> New Delhi 110001`;
          this.mailId = 'mailto:rankings@cityfinance.in';
          this.mailLabel = 'rankings@cityfinance.in';
        } else {
          this.address = ` Director, AMRUT <br />
            Ministry of Housing and Urban Affairs <br />
            210 C, Nirman Bhawan, Maulana Azad Road <br />
            New Delhi-110011`;
          this.mailId = 'mailto:contact@cityfinance.in';
          this.mailLabel = 'contact@cityfinance.in';
        }
      }
    });
  }
}
