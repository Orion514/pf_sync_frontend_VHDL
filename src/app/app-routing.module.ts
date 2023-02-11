import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DrawingboardComponent } from './drawingboard/drawingboard.component';

const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full', component: DrawingboardComponent },
  { path: '', redirectTo: '', pathMatch: 'full' },
	{ path: ':projectAddress', component: DrawingboardComponent },
 ];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
