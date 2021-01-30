import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    OrganizationsModule,
    UsersModule,
  ],
  exports: [TypeOrmModule],
})
export class CoreModule {}
