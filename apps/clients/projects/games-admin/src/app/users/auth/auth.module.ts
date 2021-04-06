import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SigninComponent } from './components/signin/signin.component';
import { AuthService } from './services/auth.service';

const routes: Routes = [
  {
    path: '',
    children: [{ path: 'signin', component: SigninComponent }],
  },
];

@NgModule({
  declarations: [SigninComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
  providers: [AuthService],
})
export class AuthModule {}
