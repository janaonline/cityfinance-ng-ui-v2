import { Component } from '@angular/core';

@Component({
  selector: 'app-no-data-found',
  standalone: true,
  imports: [],
  template: ` <div class="p-4 d-flex flex-column align-items-center justify-content-center">
    <img src="../assets/images/sad.svg" alt="Not Found" height="82px" width="82px" />
    <p class="text-cfSecondary fw-bold">No Data Found for chosen options</p>
  </div>`,
  styles: [],
})
export class NoDataFoundComponent {}
