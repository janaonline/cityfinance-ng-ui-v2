import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';
@Component({
    selector: 'app-footer',
    imports: [CommonModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
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
    this._commonService.getWebsiteVisitCount().subscribe((res: any) => {
      return (this.totalUsersVisit = res);
    });
  }
  routerNav(navlink: any) {
    console.log(navlink);
  }
  address = ` Director, AMRUT <br />
    Ministry of Housing and Urban Affairs <br />
    210 C, Nirman Bhawan, Maulana Azad Road <br />
    New Delhi-110011`;
  mailId = 'mailto:contact@cityfinance.in';
  mailLabel = 'contact@cityfinance.in';
  getPageDetails() {
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
