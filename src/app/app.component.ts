import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
// import { MenuComponent } from './shared/components/menu/menu.component';
import { environment } from '../environments/environment';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Cityfinance';
  baseUrl = environment.environment;

  constructor(private route: ActivatedRoute) {
    // const  userData:any = '{"_id":"5fcb9f836e7a0139dc6b64b6","name":"Basukinath Nagar Panchayat","email":"anjumrm@gmail.com","isActive":true,"role":"ULB","state":"5dcf9d7316a06aed41c748eb","stateName":"Jharkhand","designation":"","ulb":"5dd24b8d91344e2300876c8c","ulbCode":"JH002","stateCode":"JH","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    const userData: any = '{"_id":"5fcb9f836e7a0139dc6b64b6","name":"Mummidivaram Municipality","email":"anjumrm@gmail.com","isActive":true,"role":"ULB","state":"5dd006d4ffbcc50cfd92c87c","stateName":"Jharkhand","designation":"","ulb":"5dd24e98cc3ddc04b552b7d4","ulbCode":"JH002","stateCode":"JH","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiU3VyYXQgTXVuaWNpcGFsIENvcnBvcmF0aW9uIiwiZW1haWwiOiJjZXNwY2VsbEBnbWFpbC5jb20iLCJyb2xlIjoiVUxCIiwic3RhdGUiOiI1ZGNmOWQ3MzE2YTA2YWVkNDFjNzQ4ZTciLCJ1bGIiOiI1ZWI1ODQ0Zjc2YTNiNjFmNDBiYTA2OTMiLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNSZWdpc3RlcmVkIjp0cnVlLCJfaWQiOiI1ZmNiOWZhZjZlN2EwMTM5ZGM2YjY2MDYiLCJwdXJwb3NlIjoiV0VCIiwibGhfaWQiOiI2NjczYzNhNjJjYzkzYzIzYmFlMWIzMmUiLCJzZXNzaW9uSWQiOiI2NjczYzM5Zjg1MWRlYzIzYjA0YzA0ODciLCJwYXNzd29yZEV4cGlyZXMiOjE2Mzg2OTAzODI5NDUsInBhc3N3b3JkSGlzdG9yeSI6WyIkMmEkMTAkU1picmJxLjdVZ0s4OGwzUE5HaldJdUdBdUF1WkpoQldycGhnTHRSSVRRUUcxTC5DZVgwdC4iLCIkMmEkMTAkelkwUW9KeldBZFdhWWN5bFZFTUF3ZTdvSVZxeWFwaXAucnduTWtxeTBjVUtWdnJwa3RzRkMiXSwiaWF0IjoxNzE4ODYyNzU4LCJleHAiOjE3MTg4OTg3NTh9.yq44_xubDHACgmjjuWcq3NSlRLw7Z7zo-KUTVmJb-P8";
    const years = '{"2020-21":"606aadac4dff55e6c075c507","2021-22":"606aaf854dff55e6c075d219","2022-23":"606aafb14dff55e6c075d3ae","2023-24":"606aafc14dff55e6c075d3ec","2024-25":"606aafcf4dff55e6c075d424","2025-26":"606aafda4dff55e6c075d48f","2019-20":"607697074dff55e6c0be33ba","2017-18":"63735a4bd44534713673bfbf","2018-19":"63735a5bd44534713673c1ca"}';
    localStorage.setItem("Years", years);
    localStorage.setItem("id_token", JSON.stringify(token));
    localStorage.setItem("userData", userData);
  }

  ngOnInit(): void {
    this.getQueryParams();
  }

  getQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      // console.log('params', params);
      if (params['token']) {
        localStorage.setItem("id_token", JSON.stringify(params['token']));
      }
      if (params['ulb']) {
        // console.log('params---',params);

        const userData1: any = { ulb: params['ulb'] };
        localStorage.setItem("userData", JSON.stringify(userData1));
      }
    });
  }
}
