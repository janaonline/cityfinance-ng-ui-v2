import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { XviFCComponent } from './xvi-fc.component';

const routes: Routes = [
  {
    path: '',
    component: XviFCComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class XviFCRoutingModule { }
