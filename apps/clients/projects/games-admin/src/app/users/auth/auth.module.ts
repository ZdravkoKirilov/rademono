import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from '@games-admin/shared';
import { SigninComponent } from './components/signin/signin.component';
import { RedeemComponent } from './components/redeem/redeem.component';
import { WithoutAuthGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'signin',
        component: SigninComponent,
        canActivate: [WithoutAuthGuard],
      },
      {
        path: 'signin/code',
        component: RedeemComponent,
        canActivate: [WithoutAuthGuard],
      },
    ],
  },
];

@NgModule({
  declarations: [SigninComponent, RedeemComponent],
  imports: [
    HttpClientModule,
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
  ],
  exports: [RouterModule],
  providers: [WithoutAuthGuard],
})
export class AuthModule {}
