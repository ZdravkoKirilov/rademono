import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { UiModule } from '@libs/ui';
import { NavbarComponent } from './components/navbar/navbar.component';

@NgModule({
  declarations: [NavbarComponent],
  imports: [CommonModule, TranslateModule, RouterModule],
  exports: [TranslateModule, CommonModule, UiModule, NavbarComponent],
})
export class SharedModule {}
