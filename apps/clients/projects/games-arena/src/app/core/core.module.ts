import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRootComponent } from './components/app-root/app-root.component';

@NgModule({
  declarations: [AppRootComponent],
  imports: [CommonModule],
  exports: [AppRootComponent],
})
export class CoreModule {}
