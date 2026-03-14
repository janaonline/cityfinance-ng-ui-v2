import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppMenuItemComponent } from './app.menu-item';
import { SideBarModel } from './interface';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, AppMenuItemComponent],
  templateUrl: './app.menu.html',
  styleUrl: './app.menu-item.scss',
})
export class AppMenuComponent {
  readonly model = input.required<SideBarModel>();

  topModel = computed(() => this.model()['topModel']);

  bottomModel = computed(() => this.model()['bottomModel']);

  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }
}

// Sample menu model for testing purposes
// this.model = [
//   {
//     label: 'Disabled Home',
//     icon: 'bi bi-house-fill',
//     disabled: true,
//   },
//   {
//     label: 'XVIFC Home',
//     routerLink: ['/xvifc-forms'],
//     icon: 'bi bi-house-fill',
//   },
//   { label: 'Separator', separator: true },
//   {
//     label: 'Entry Level Conditions',
//     items: [
//       {
//         label: 'Detailed Utilisation Report',
//         icon: 'bi bi-clipboard2-data-fill',
//         routerLink: ['/dur'],
//       },
//       {
//         label: 'Annual Accounts',
//         icon: 'bi bi-journal-bookmark-fill',
//         routerLink: ['/annual-accounts'],
//       },
//       {
//         label: 'Service Level Benchmarks',
//         icon: 'bi bi-speedometer',
//         routerLink: ['/service-level-benchmarks'],
//       },
//     ],
//   },
//   {
//     label: 'Performance Conditions',
//     items: [
//       {
//         label: 'Open Defecation Free',
//         icon: 'bi bi-shield-fill-check',
//         routerLink: ['/open-defecation-free'],
//       },
//       {
//         label: 'Garbage Free City',
//         icon: 'bi bi-trash-fill',
//         routerLink: ['/garbage-free-city'],
//       },
//       {
//         label: 'Create sub children',
//         icon: 'bi bi-diagram-2-fill',
//         items: [
//           {
//             label: 'Child 1 with longer length',
//             icon: 'bi bi-person-fill',
//             routerLink: ['/child-1'],
//           },
//           {
//             label: 'Child 2',
//             icon: 'bi bi-person-fill',
//             routerLink: ['/child-2'],
//           },
//         ],
//       },
//     ],
//   },
// ];
