import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule],
})
export class HeaderComponent {

  constructor() { }

  get getRatio() {
    const ZOOM: number = 0.001152073732718894;
    const zoomValue = window.innerHeight * ZOOM;
    return window.innerWidth < 992 ? 1 : zoomValue;
  }

  scrollOnePageDown() {
    const viewportHeight = window.innerHeight;
    window.scrollBy(0, viewportHeight * 0.9);
  }


}
