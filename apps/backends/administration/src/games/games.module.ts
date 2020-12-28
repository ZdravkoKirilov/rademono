import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesController } from './controllers/games/games.controller';

import { Game } from './db-models';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  exports: [TypeOrmModule],
  controllers: [GamesController],
})
export class GamesModule {}
