import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreviewComponent } from './preview.component';

const routes: Routes = [
  { path: ':owner/:name', component: PreviewComponent },
  { path: '**', redirectTo: '/search' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreviewRoutingModule {}
