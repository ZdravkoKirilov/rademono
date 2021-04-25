import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { WithAuthGuard } from '@games-admin/users/auth';
import { SharedModule } from '@games-admin/shared';
import { OrganizationsComponent } from './components/organizations/organizations.component';
import { FeedComponent } from './components/feed/feed.component';
import { StatsComponent } from './components/stats/stats.component';

const routes: Routes = [
  {
    path: '',
    component: HomeDashboardComponent,
    canActivate: [WithAuthGuard],
  },
];

@NgModule({
  declarations: [
    HomeDashboardComponent,
    OrganizationsComponent,
    FeedComponent,
    StatsComponent,
  ],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  providers: [WithAuthGuard],
})
export class HomeModule {}
