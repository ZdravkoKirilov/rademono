import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UUIDv4 } from '@end/global';
import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { OrganizationsModule } from '../organizations';
import { GameEditorModule } from '../game-editor';
import { UsersModule } from '../users';
import { AppConfigModule, AppConfigService } from '../config';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.getDBPort(),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    GameEditorModule,
    UsersModule,
    OrganizationsModule,
  ],
  exports: [TypeOrmModule],
  providers: [
    {
      provide: PUBLIC_ID_GENERATOR,
      useValue: UUIDv4.generate,
    },
  ],
})
export class CoreModule {}
