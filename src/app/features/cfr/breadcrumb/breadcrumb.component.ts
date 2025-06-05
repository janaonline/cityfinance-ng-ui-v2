import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface BreadcrumbLink {
  label: string;
  url: string;
  class?: string;
}

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    imports: [CommonModule, RouterModule]
})
export class BreadcrumbComponent {

  @Input() links!: BreadcrumbLink[];

  constructor() { }

}
