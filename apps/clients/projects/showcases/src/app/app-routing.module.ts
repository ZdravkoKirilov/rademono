import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ButtonsComponent } from './buttons/buttons.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { GlobalLoaderComponent } from './global-loader/global-loader.component';
import { InputsComponent } from './inputs/inputs.component';

const routes: Routes = [
  {
    path: 'buttons',
    component: ButtonsComponent,
  },
  {
    path: 'inputs',
    component: InputsComponent,
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
  },
  {
    path: 'global-loader',
    component: GlobalLoaderComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
