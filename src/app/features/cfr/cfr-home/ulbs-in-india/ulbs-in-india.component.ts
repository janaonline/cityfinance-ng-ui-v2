import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ulbs-in-india',
  templateUrl: './ulbs-in-india.component.html',
  styleUrls: ['./ulbs-in-india.component.scss'],
  standalone: true,
  imports: [CommonModule]

})
export class UlbsInIndiaComponent {

  @Input() data: any;

  constructor() { }


}
