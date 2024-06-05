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
    const  userData:any = '{"_id":"5fcb9f836e7a0139dc6b64b6","name":"Mummidivaram Municipality","email":"anjumrm@gmail.com","isActive":true,"role":"ULB","state":"5dcf9d7316a06aed41c748eb","stateName":"Jharkhand","designation":"","ulb":"5dd24b8d91344e2300876c8c","ulbCode":"JH002","stateCode":"JH","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXVtbWlkaXZhcmFtIE11bmljaXBhbGl0eSIsImVtYWlsIjoiY29tbWlzc2lvbmVybW1kQGdtYWlsLmNvbSIsInJvbGUiOiJVTEIiLCJzdGF0ZSI6IjVkY2Y5ZDcyMTZhMDZhZWQ0MWM3NDhkZCIsInVsYiI6IjVkZDI0NzI4NDM3YmEzMWY3ZWI0MmU3ZSIsImlzQWN0aXZlIjp0cnVlLCJpc1JlZ2lzdGVyZWQiOnRydWUsIl9pZCI6IjVmY2I5ZjFjNmU3YTAxMzlkYzZiNjFhNiIsInB1cnBvc2UiOiJXRUIiLCJsaF9pZCI6IjY2NjAyZThmOGNhNGZmMTIyYTdkZTE1MiIsInNlc3Npb25JZCI6IjY2NjAyZTdkOGNhNGZmMTIyYTdkZTE0OSIsInBhc3N3b3JkRXhwaXJlcyI6MTY0Nzg1NDAzMjYyMywicGFzc3dvcmRIaXN0b3J5IjpbIiQyYSQxMCRobExudkRTZndGMU14NVFvamRZdWQuL0xDNzN2ZjR1S25uZ0pyRGhGbklMeWNWNlAzdEFXLiIsIiQyYSQxMCRJMEh4Ni52WVA4TTZ4OWo3VFVheUVPSWRQNW13OE5HSlRlNGlvaG1yaURmUUp4NHZSZGF6NiJdLCJpYXQiOjE3MTc1Nzk0MDcsImV4cCI6MTcxNzYxNTQwN30.JZ_fPE1rzGX7SdoVoHun1srr4byqNg5W8vghoYew4vM";
    const years = '{"2020-21":"606aadac4dff55e6c075c507","2021-22":"606aaf854dff55e6c075d219","2022-23":"606aafb14dff55e6c075d3ae","2023-24":"606aafc14dff55e6c075d3ec","2024-25":"606aafcf4dff55e6c075d424","2025-26":"606aafda4dff55e6c075d48f","2019-20":"607697074dff55e6c0be33ba","2017-18":"63735a4bd44534713673bfbf","2018-19":"63735a5bd44534713673c1ca"}';
    // localStorage.setItem("Years", years);
    localStorage.setItem("id_token", JSON.stringify(token));
    localStorage.setItem("userData", userData);
  }
}
