import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent, SvgIconsModule } from '@ngneat/svg-icon';

import { appSuccessIcon } from '../../generated-icons/success';
import { appWarningIcon } from '../../generated-icons/warning';
import { appErrorIcon } from '../../generated-icons/error';
import { appCrossIcon } from '../../generated-icons/cross';

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
      icons: [appSuccessIcon, appWarningIcon, appErrorIcon, appCrossIcon],
    }),
  ],
  exports: [SvgIconsModule, SvgIconComponent],
})
export class IconsModule {}
