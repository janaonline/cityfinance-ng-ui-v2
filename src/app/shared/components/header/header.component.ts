import { Component } from '@angular/core';
import { IUserLoggedInDetails } from '../../../core/models/login/userLoggedInDetails';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  size: any;
  textSize = ["sm", "rg", "lg"];
  currentTextSize: any;
  constructor(
  ) { }


  setFontSize(size: string) {
    console.log('setFontSize', size)
    // this.size= size;
    let elem = document.documentElement;

    this.textSize.forEach((item) => elem.classList.remove(item));
    elem.classList.add(size);
    this.currentTextSize = size;
    localStorage.setItem(
      "myLSkey",
      JSON.stringify({
        currentTextSize: size,
      })
    );
  }

  scroll() {
    window.scrollTo({
      top: 1000,

      behavior: "smooth",
    });
  }

}