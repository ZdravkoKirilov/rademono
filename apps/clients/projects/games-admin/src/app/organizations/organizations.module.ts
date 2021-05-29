import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CreateOrganizationComponent } from './components/create-organization/create-organization.component';
import { SharedModule } from '@games-admin/shared';
import { OrganizationDashboardComponent } from './components/organization-dashboard/organization-dashboard.component';
import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';
import { OrganizationStatsComponent } from './components/organization-stats/organization-stats.component';

const routes: Routes = [
  {
    path: 'create',
    component: CreateOrganizationComponent,
  },
  {
    path: ':name',
    component: OrganizationDashboardComponent,
    children: [
      {
        path: 'settings',
        component: OrganizationSettingsComponent,
      },
      {
        path: 'stats',
        component: OrganizationStatsComponent,
      },
      {
        path: 'collections',
        component: CreateOrganizationComponent,
      },
      {
        path: '',
        redirectTo: 'collections',
      },
      {
        path: '*',
        redirectTo: 'collections',
      },
    ],
  },
];

@NgModule({
  declarations: [
    CreateOrganizationComponent,
    OrganizationDashboardComponent,
    OrganizationSettingsComponent,
    OrganizationStatsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
  ],
  exports: [RouterModule],
})
export class OrganizationsModule {}
