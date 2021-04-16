import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent, SvgIconsModule } from '@ngneat/svg-icon';

import { appSuccessIcon } from '../../generated-icons/success';
import { appWarningIcon } from '../../generated-icons/warning';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SvgIconsModule.forRoot({
      sizes: {
        xs: '10px',
        sm: '16px',
        md: '22px',
        lg: '28px',
        xl: '40px',
        xxl: '60px',
      },
      defaultSize: 'md',
      icons: [appSuccessIcon, appWarningIcon],
    }),
  ],
  exports: [SvgIconsModule, SvgIconComponent],
})
export class IconsModule {}
