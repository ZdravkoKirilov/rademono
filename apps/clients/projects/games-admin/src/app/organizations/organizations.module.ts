import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppRoutes, RouteParams, SharedModule } from '@games-admin/shared';

import { CreateOrganizationComponent } from './components/create-organization/create-organization.component';
import { OrganizationDashboardComponent } from './components/organization-dashboard/organization-dashboard.component';
import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';
import { OrganizationStatsComponent } from './components/organization-stats/organization-stats.component';

const routes: AppRoutes = [
  {
    path: 'create',
    component: CreateOrganizationComponent,
  },
  {
    path: `:${RouteParams.organizationId}`,
    component: OrganizationDashboardComponent,
    children: [
      {
        path: 'settings',
        component: OrganizationSettingsComponent,
        data: {
          key: 'org-settings',
        },
      },
      {
        path: 'stats',
        component: OrganizationStatsComponent,
        data: {
          key: 'org-stats',
        },
      },
      {
        path: 'collections',
        data: {
          key: 'collections',
        },
        loadChildren: () =>
          import('../collections').then((m) => m.CollectionsModule),
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
