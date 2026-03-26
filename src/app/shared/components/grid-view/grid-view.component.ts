import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-grid-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-view.component.html',
  styleUrl: './grid-view.component.scss',
})
export class GridViewComponent {
  grid = [
    { value: '2 Million', desc: 'Population', info: '' },
    { value: '85', desc: 'Wards', info: '' },
    { value: '276 Sq Km', desc: 'Area', info: '' },
    { value: '8', desc: 'Years of Financial data', info: '' },
    { value: '7,116.25/ Sq km', desc: 'Population Density', info: '' },
    { value: 'Yes (Indore U.A.)', desc: 'Part of UA', info: '' },
  ];
  // items = [
  //   { title: 'Box 1', gradient: 'linear-gradient(to right,#F2F8FE,#FFFFFF)' },
  //   { title: 'Box 2', gradient: 'linear-gradient(to right,#DBE4F9,#FBFCFF)' },
  //   { title: 'Box 3', gradient: 'linear-gradient(to right,#E5ECFC,#DBE4F9,#FBFCFF)' },
  //   { title: 'Box 4', gradient: 'linear-gradient(to right,#F2F8FE,#FFFFFF)' },
  //   { title: 'Box 5', gradient: 'linear-gradient(to right,#F2F8FE,#FFFFFF)' },
  //   { title: 'Box 6', gradient: 'linear-gradient(to right,#FBFCFF,#DBE4F9)' },
  // ];
  gradients = [
    'linear-gradient(to right,#F2F8FE,#FFFFFF)',
    'linear-gradient(to right,#DBE4F9,#FBFCFF)',
    'linear-gradient(to right,#E5ECFC,#DBE4F9,#FBFCFF)',
    'linear-gradient(to right,#F2F8FE,#FFFFFF)',
    'linear-gradient(to right,#F2F8FE,#FFFFFF)',
    'linear-gradient(to right,#FBFCFF,#DBE4F9)',
  ];
  items = this.grid.map((box, index) => ({
    ...box,
    gradient: this.gradients[index % this.gradients.length], // cycle if more boxes than gradients
  }));
}
