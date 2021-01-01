import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DtoGame, Game, unTag } from '@end/global';

import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameDBModel } from './game.db.model';

@Injectable()
export class GamesService {

  constructor(
    @InjectRepository(GameDBModel)
    private gamesRepository: Repository<GameDBModel>,
  ) { }

  /*   create(createGameDto: CreateGameDto) {
      
    } */

  async create(payload: unknown) {
  
  }

  findAll() {
    return `This action returns all games`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
