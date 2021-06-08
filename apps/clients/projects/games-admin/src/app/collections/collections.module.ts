import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '@games-admin/shared';
import { CollectionsListComponent } from './components/collections-list/collections-list.component';
import { CreateCollectionComponent } from './components/create-collection/create-collection.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: CollectionsListComponent,
  },
  {
    path: 'create',
    component: CreateCollectionComponent,
  },
];

@NgModule({
  declarations: [CreateCollectionComponent, CollectionsListComponent],
  imports: [SharedModule, RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})
export class CollectionsModule {}
