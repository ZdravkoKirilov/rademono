import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameEditorModule } from '../game-editor';

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
  ],
  exports: [TypeOrmModule],
})
export class CoreModule {}
