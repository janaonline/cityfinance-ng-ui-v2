import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
// import { MenuComponent } from './shared/components/menu/menu.component';
import { environment } from '../environments/environment';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    HttpClientModule,
    FooterComponent,
    HeaderComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cityfinance-ng-ui-v2';
  baseUrl = environment.environment;
  
  constructor() {
    const  userData:any = '{"_id":"5fcb9f836e7a0139dc6b64b6","name":"Basukinath Nagar Panchayat","email":"anjumrm@gmail.com","isActive":true,"role":"ULB","state":"5dcf9d7316a06aed41c748eb","stateName":"Jharkhand","designation":"","ulb":"5dd24b8d91344e2300876c8c","ulbCode":"JH002","stateCode":"JH","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQmFzdWtpbmF0aCBOYWdhciBQYW5jaGF5YXQiLCJlbWFpbCI6ImFuanVtcm1AZ21haWwuY29tIiwicm9sZSI6IlVMQiIsInN0YXRlIjoiNWRjZjlkNzMxNmEwNmFlZDQxYzc0OGViIiwidWxiIjoiNWRkMjRiOGQ5MTM0NGUyMzAwODc2YzhjIiwiaXNBY3RpdmUiOnRydWUsImlzUmVnaXN0ZXJlZCI6dHJ1ZSwiX2lkIjoiNWZjYjlmODM2ZTdhMDEzOWRjNmI2NGI2IiwicHVycG9zZSI6IldFQiIsImxoX2lkIjoiNjY1MDNlZWVhM2YyOWQwNzVlN2Q4ZjdmIiwic2Vzc2lvbklkIjoiNjY1MDNlZGE1OTRjNzEwNzU4OGNiZWE5IiwicGFzc3dvcmRFeHBpcmVzIjoxNjE2NjAyMjAwODkzLCJwYXNzd29yZEhpc3RvcnkiOlsiJDJhJDEwJGxxeTRTazVrdGJ0SGVQdDlhMDZ0NE83aWVSZ0pCcHhRckc5SExmSDlOOFlXVXlMT0kwdEwuIl0sImlhdCI6MTcxNjUzNTAyMiwiZXhwIjoxNzE2NTcxMDIyfQ.x79J5XztTEgRNgulRMKSxsFraq3F20yxfWSnWJMcH8g";
    const years = '{"2020-21":"606aadac4dff55e6c075c507","2021-22":"606aaf854dff55e6c075d219","2022-23":"606aafb14dff55e6c075d3ae","2023-24":"606aafc14dff55e6c075d3ec","2024-25":"606aafcf4dff55e6c075d424","2025-26":"606aafda4dff55e6c075d48f","2019-20":"607697074dff55e6c0be33ba","2017-18":"63735a4bd44534713673bfbf","2018-19":"63735a5bd44534713673c1ca"}';
    // localStorage.setItem("Years", years);
    // localStorage.setItem("id_token", token);
    // localStorage.setItem("userData", userData);
  }
}
