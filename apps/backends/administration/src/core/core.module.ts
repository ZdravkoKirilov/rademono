import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesModule } from '../games';

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
    GamesModule,
  ],
  exports: [TypeOrmModule, GamesModule],
})
export class CoreModule {}
