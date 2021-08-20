import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { RedeemComponent } from './components/redeem/redeem.component';



@NgModule({
  declarations: [
    SignInComponent,
    RedeemComponent
  ],
  imports: [
    CommonModule
  ]
})
export class UsersModule { }
