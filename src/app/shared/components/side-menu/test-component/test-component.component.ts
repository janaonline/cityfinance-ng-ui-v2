import { Component } from '@angular/core';
import { AppMenuComponent } from '../app.menu';

@Component({
  selector: 'app-test-component',
  imports: [AppMenuComponent],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.scss',
})
export class TestComponentComponent {}
