import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CreateOrganizationComponent } from './components/create-organization/create-organization.component';
import { SharedModule } from '@games-admin/shared';
import { OrganizationDashboardComponent } from './components/organization-dashboard/organization-dashboard.component';

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
  declarations: [CreateOrganizationComponent, OrganizationDashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
  ],
  exports: [RouterModule],
})
export class OrganizationsModule {}
