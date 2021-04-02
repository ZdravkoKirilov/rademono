import { Module } from '@nestjs/common';

import { UUIDv4 } from '@end/global';
import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { OrganizationsModule } from '../organizations';
import { GameEditorModule } from '../game-editor';
import { UsersModule } from '../users';
import { AppConfigModule } from '../config';

@Module({
  imports: [
    AppConfigModule,
    GameEditorModule,
    UsersModule,
    OrganizationsModule,
  ],
  exports: [],
  providers: [
    {
      provide: PUBLIC_ID_GENERATOR,
      useValue: UUIDv4.generate,
    },
  ],
})
export class CoreModule {}
