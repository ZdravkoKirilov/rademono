import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GameDBModel } from './game.db.model';

@Module({
  controllers: [GamesController],
  providers: [GamesService],
  imports: [
    TypeOrmModule.forFeature([GameDBModel])
  ]
})
export class GamesModule { }
