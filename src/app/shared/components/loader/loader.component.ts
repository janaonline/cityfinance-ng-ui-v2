
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    imports: [MaterialModule]
})
export class LoaderComponent {
  colorSequence = ['success', 'danger', 'warning', 'info'];

  constructor() {}
  @Input() show: boolean = false;
  @Input() dots: number = 3;
  ngOnInit(): void {
    // console.log('show', this.show);
  }
}
