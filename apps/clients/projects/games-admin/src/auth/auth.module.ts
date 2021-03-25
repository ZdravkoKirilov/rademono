import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SigninComponent } from './signin/signin.component';

const routes: Routes = [
  {
    path: 'auth',
    children: [{ path: 'signin', component: SigninComponent }],
  },
];

@NgModule({
  declarations: [SigninComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})
export class AuthModule {}
