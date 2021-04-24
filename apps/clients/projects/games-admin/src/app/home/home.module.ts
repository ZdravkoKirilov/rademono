import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { WithAuthGuard } from '@games-admin/users/auth';
import { SharedModule } from '@games-admin/shared';

const routes: Routes = [
  {
    path: '',
    component: HomeDashboardComponent,
    canActivate: [WithAuthGuard],
  },
];

@NgModule({
  declarations: [HomeDashboardComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  providers: [WithAuthGuard],
})
export class HomeModule {}
