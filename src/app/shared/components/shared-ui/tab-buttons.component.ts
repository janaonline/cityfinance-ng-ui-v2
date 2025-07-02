import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output, signal } from '@angular/core';
import { ButtonObj } from '../../../core/models/interfaces';

@Component({
  selector: 'app-tab-buttons',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="d-flex my-4 overflow-x-auto">
    @for (btn of buttons(); track $index) {
      <button
        role="button"
        class="btn rounded-5 m-2 text-nowrap"
        [ngClass]="selectedBtnKey() === btn.key ? 'btn-cfPrimary' : 'btn-outline-cfPrimary'"
        (click)="buttonClick(btn.key)"
      >
        {{ btn.label }}
      </button>
    }
  </div>`,
  styles: [],
})
export class TabButtonsComponent implements OnInit {
  // Input signal to receive the array of buttons from the parent.
  buttons = input.required<ButtonObj[]>();

  // Output signal to emit the key of the selected button to the parent.
  selectedButtonKeyChange = output<string>();

  // Internal signal to keep track of the currently selected button's key
  selectedBtnKey = signal<string>('');

  constructor() {}

  ngOnInit() {
    console.log('buttons sent from parent to child: ', this.buttons());
    if (this.buttons().length > 0) {
      this.selectedBtnKey.set(this.buttons()[0].key);
      this.selectedButtonKeyChange.emit(this.buttons()[0].key);
    }
  }

  buttonClick(key: string): void {
    this.selectedBtnKey.set(key);
    this.selectedButtonKeyChange.emit(key);
  }
}
