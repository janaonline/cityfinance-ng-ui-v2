import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class LoaderComponent {

  colorSequence = ['success', 'danger', 'warning', 'info'];

  constructor() { }
  @Input() show: boolean = false;
  @Input() dots: number = 3;
  ngOnInit(): void {
    console.log('show', this.show);
    
  }

}