import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppMenuItemComponent } from './app.menu-item';
import { MenuItem } from './interface';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, AppMenuItemComponent],
  templateUrl: './app.menu.html',
  styleUrl: './app.menu-item.scss',
})
export class AppMenuComponent implements OnInit {
  model: MenuItem[] = [];
  bottomModel: MenuItem[] = [];
  isSidebarCollapsed = signal(false);

  ngOnInit() {
    this.model = [
      {
        label: 'XVI Financial Commission',
        routerLink: ['/xvifc-forms'],
        icon: 'bi bi-bank',
      },
      { label: '_', separator: true },

      {
        label: 'Overview',
        routerLink: ['/overview'],
        icon: 'bi bi-speedometer2',
      },
      {
        label: 'Review',
        icon: 'bi bi-clipboard-data',
        items: [
          {
            label: 'ULB Submissions',
            icon: 'bi bi-upload',
            routerLink: ['/ulb-submissions'],
          },
          {
            label: 'Insights',
            icon: 'bi bi-bar-chart-line',
            routerLink: ['/insights'],
          },
          {
            label: 'Messages',
            icon: 'bi bi-chat-dots',
            routerLink: ['/messages'],
          },
          {
            label: 'Reports',
            icon: 'bi bi-file-earmark-text',
            routerLink: ['/reports'],
          },
        ],
      },
      {
        label: 'State level conditions',
        icon: 'bi bi-diagram-3',
        items: [
          {
            label: 'FY 2026-27 Requirements',
            icon: 'bi bi-list-check',
            routerLink: ['/xvifc-forms'],
          },
          {
            label: 'SFC Status',
            icon: 'bi bi-building',
            routerLink: ['/sfc-status'],
          },
          {
            label: 'Elected Body Status',
            icon: 'bi bi-person-badge',
            routerLink: ['/elected-body-status'],
          },
          {
            label: 'Devolution Formula',
            icon: 'bi bi-calculator',
            routerLink: ['/devolution-formula'],
          },
        ],
      },
      {
        label: 'XVI-FC Grants',
        icon: 'bi bi-cash-stack',
        items: [
          {
            label: 'Special Infrastructure',
            icon: 'bi bi-hammer',
            routerLink: ['/special-infrastructure'],
          },
          {
            label: 'Urbanisation Premium',
            icon: 'bi bi-buildings',
            routerLink: ['/urbanisation-premium'],
          },
        ],
      },
      {
        label: 'Doe tracking',
        icon: 'bi bi-activity',
        items: [
          {
            label: 'DoE Status',
            icon: 'bi bi-check2-circle',
            routerLink: ['/doe-status'],
          },
        ],
      },
      {
        label: 'Settings',
        icon: 'bi bi-gear',
        items: [
          {
            label: 'Profile',
            icon: 'bi bi-person-circle',
            routerLink: ['/profile'],
          },
          {
            label: 'Resources',
            icon: 'bi bi-folder2-open',
            routerLink: ['/resources'],
          },
        ],
      },
    ];

    this.bottomModel = [
      {
        label: 'Give feedback',
        icon: 'bi bi-chat-square-text',
        expanded: false,
        routerLink: ['/feedback'],
        items: [
          {
            label: 'Profile',
            icon: 'bi bi-person-circle',
            routerLink: ['/profile'],
          },
          {
            label: 'Resources',
            icon: 'bi bi-folder2-open',
            routerLink: ['/resources'],
          },
        ],
      },
    ];
  }

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
