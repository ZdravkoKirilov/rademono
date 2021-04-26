import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CreateOrganizationComponent } from './components/create-organization/create-organization.component';
import { SharedModule } from '@games-admin/shared';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: 'create',
    component: CreateOrganizationComponent,
  },
];

@NgModule({
  declarations: [CreateOrganizationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
  ],
  exports: [RouterModule],
})
export class OrganizationsModule {}
