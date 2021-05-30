import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CollectionsListComponent } from './components/collections-list/collections-list.component';

const routes: Routes = [
  {
    path: '',
    component: CollectionsListComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class CollectionsModule {}
