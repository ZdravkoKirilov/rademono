import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GameRepository } from './game.repository';

@Module({
  controllers: [GamesController],
  providers: [GamesService],
  imports: [
    TypeOrmModule.forFeature([GameRepository])
  ]
})
export class GamesModule { }
