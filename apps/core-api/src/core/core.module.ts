import { Module } from '@nestjs/common';

import { UUIDv4 } from '@end/global';
import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { OrganizationsModule } from '../organizations';
import { UsersModule } from '../users';
import { AppConfigModule } from '../config';
import { EmailsModule } from '../emails';

@Module({
  imports: [AppConfigModule, UsersModule, OrganizationsModule, EmailsModule],
  exports: [],
  providers: [
    {
      provide: PUBLIC_ID_GENERATOR,
      useValue: UUIDv4.generate,
    },
  ],
})
export class CoreModule {}
