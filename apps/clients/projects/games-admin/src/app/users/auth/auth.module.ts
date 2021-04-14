import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { SharedModule } from '@games-admin/shared';
import { SigninComponent } from './components/signin/signin.component';
import { AuthService } from './services/auth.service';
import { RedeemComponent } from './components/redeem/redeem.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'signin', component: SigninComponent },
      { path: 'signin/code', component: RedeemComponent },
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
  providers: [AuthService],
})
export class AuthModule {}
