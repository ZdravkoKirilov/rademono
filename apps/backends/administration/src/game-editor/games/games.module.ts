import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GameDBModel, GameRepository } from './game.repository';

@Module({
  controllers: [GamesController],
  providers: [GamesService, GameRepository],
  imports: [TypeOrmModule.forFeature([GameDBModel])],
})
export class GamesModule {}
