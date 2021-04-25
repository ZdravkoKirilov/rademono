import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CreateOrganizationComponent } from './components/create-organization/create-organization.component';
import { OrganizationFormComponent } from './components/organization-form/organization-form.component';

const routes: Routes = [
  {
    path: 'create',
    component: CreateOrganizationComponent,
  },
];

@NgModule({
  declarations: [CreateOrganizationComponent, OrganizationFormComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsModule {}
