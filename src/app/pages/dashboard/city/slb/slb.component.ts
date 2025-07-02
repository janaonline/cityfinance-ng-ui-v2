import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ButtonObj } from '../../../../core/models/interfaces';
import { TabButtonsComponent } from '../../../../shared/components/shared-ui/tab-buttons.component';

@Component({
  selector: 'app-slb',
  imports: [CommonModule, TabButtonsComponent],
  templateUrl: './slb.component.html',
  styleUrl: './slb.component.scss',
})
export class SlbComponent {
  readonly buttons: ButtonObj[] = [
    { key: 'waterSupply', label: 'Water Supply' },
    { key: 'wasteWaterManagement', label: 'Waste Water Management' },
    { key: 'solidWasteManagement', label: 'Solid Waste Management' },
    { key: 'stromWaterDrainage', label: 'Strom Water Drainage' },
  ];
  currentSelectedButtonKey = signal<string>('');

  constructor() {}

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key);
  }
}
