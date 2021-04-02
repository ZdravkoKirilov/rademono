import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';

import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GameRepository } from './game.repository';
import { GAMES_COLLECTION } from './constants';

@Module({
  controllers: [GamesController],
  providers: [GamesService, GameRepository],
  imports: [DatabaseModule.forFeature(GAMES_COLLECTION)],
})
export class GamesModule {}
