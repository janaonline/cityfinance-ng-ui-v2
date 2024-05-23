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
    // const  userData:any = '{"_id":"5fcb9f836e7a0139dc6b64b6","name":"Basukinath Nagar Panchayat","email":"anjumrm@gmail.com","isActive":true,"role":"ULB","state":"5dcf9d7316a06aed41c748eb","stateName":"Jharkhand","designation":"","ulb":"5dd24b8d91344e2300876c8c","ulbCode":"JH002","stateCode":"JH","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQmFzdWtpbmF0aCBOYWdhciBQYW5jaGF5YXQiLCJlbWFpbCI6ImFuanVtcm1AZ21haWwuY29tIiwicm9sZSI6IlVMQiIsInN0YXRlIjoiNWRjZjlkNzMxNmEwNmFlZDQxYzc0OGViIiwidWxiIjoiNWRkMjRiOGQ5MTM0NGUyMzAwODc2YzhjIiwiaXNBY3RpdmUiOnRydWUsImlzUmVnaXN0ZXJlZCI6dHJ1ZSwiX2lkIjoiNWZjYjlmODM2ZTdhMDEzOWRjNmI2NGI2IiwicHVycG9zZSI6IldFQiIsImxoX2lkIjoiNjY0ZGVkYTNhM2YyOWQwNzVlN2Q4MWYyIiwic2Vzc2lvbklkIjoiNjY0ZGExMDBhM2YyOWQwNzVlN2Q2YTgyIiwicGFzc3dvcmRFeHBpcmVzIjoxNjE2NjAyMjAwODkzLCJwYXNzd29yZEhpc3RvcnkiOlsiJDJhJDEwJGxxeTRTazVrdGJ0SGVQdDlhMDZ0NE83aWVSZ0pCcHhRckc5SExmSDlOOFlXVXlMT0kwdEwuIl0sImlhdCI6MTcxNjM4MzEzOSwiZXhwIjoxNzE2NDE5MTM5fQ.Y4Rd5okDJMKhwrxMHp8R7OfJyOT5SurTAuCdqN7s50s'
    // localStorage.setItem("id_token", token);
    // localStorage.setItem("userData", userData);
  }
}
