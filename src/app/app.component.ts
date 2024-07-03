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
    const  userData:any = '{"_id":"66772cd175ff6f339c3efb45","name":"User 1","email":"user1_16fc@cityfinance.in","isActive":true,"role":"XVIFC","designation":"XVIFC_USER","ulbCode":"","stateCode":"","isUA":null,"isMillionPlus":null,"isUserVerified2223":false}';
    // const userData: any = '{"_id":"5fcb9f836e7a0139dc6b64b6","name":"Mummidivaram Municipality","email":"anjumrm@gmail.com","isActive":true,"role":"ULB","state":"5dd006d4ffbcc50cfd92c87c","stateName":"Jharkhand","designation":"","ulb":"5dd24e98cc3ddc04b552b7d4","ulbCode":"JH002","stateCode":"JH","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    // const userData: any = '{"_id":"5fcb9ce06e7a0139dc6b514e","name":"Barpeta Municipal Board","email":"hpathakbarpeta@gmail.com","isActive":true,"role":"ULB","state":"5dcf9d7216a06aed41c748df","stateName":"Assam","designation":"","ulb":"5dcfca53df6f59198c4ac3d5","ulbCode":"AS001","stateCode":"AS","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVXNlciAxIiwiZW1haWwiOiJ1c2VyMV8xNmZjQGNpdHlmaW5hbmNlLmluIiwicm9sZSI6IlhWSUZDIiwiaXNBY3RpdmUiOnRydWUsImlzUmVnaXN0ZXJlZCI6ZmFsc2UsIl9pZCI6IjY2NzcyY2QxNzVmZjZmMzM5YzNlZmI0NSIsInB1cnBvc2UiOiJXRUIiLCJsaF9pZCI6IjY2N2U1Mzk0N2M5YzBiNmQxNjI5YmEwOSIsInNlc3Npb25JZCI6IjY2N2U1MzhhN2M5YzBiNmQxNjI5YmEwNCIsInBhc3N3b3JkSGlzdG9yeSI6W10sImlhdCI6MTcxOTU1NDk2NCwiZXhwIjoxNzE5NTkwOTY0fQ.Zhh_r_h5e9Ij8m8BAKFRlPL_hwPgMtTFd5Zn02caLq0";
    const years = '{"2020-21":"606aadac4dff55e6c075c507","2021-22":"606aaf854dff55e6c075d219","2022-23":"606aafb14dff55e6c075d3ae","2023-24":"606aafc14dff55e6c075d3ec","2024-25":"606aafcf4dff55e6c075d424","2025-26":"606aafda4dff55e6c075d48f","2019-20":"607697074dff55e6c0be33ba","2017-18":"63735a4bd44534713673bfbf","2018-19":"63735a5bd44534713673c1ca"}';
    // localStorage.setItem("Years", years);
    // localStorage.setItem("id_token", JSON.stringify(token));
    // localStorage.setItem("userData", userData);
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
