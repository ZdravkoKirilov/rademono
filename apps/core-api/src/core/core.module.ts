import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationsModule } from '../organizations';
import { GameEditorModule } from '../game-editor';
import { UsersModule } from '../users';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'postgres',
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
    }),
    GameEditorModule,
    OrganizationsModule,
    UsersModule,
  ],
  exports: [TypeOrmModule],
})
export class CoreModule {}
