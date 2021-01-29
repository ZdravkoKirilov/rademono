import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { OrganizationsModule } from '../organizations';
import { GameEditorModule } from '../game-editor';
import { UsersModule } from '../users';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(__dirname, '../../.env'),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    /*     TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: process.env['DB_PASSWORD'],
      database: 'postgres',
      synchronize: true,
      autoLoadEntities: true,
    }), */
    GameEditorModule,
    OrganizationsModule,
    UsersModule,
  ],
  exports: [TypeOrmModule],
})
export class CoreModule {}
