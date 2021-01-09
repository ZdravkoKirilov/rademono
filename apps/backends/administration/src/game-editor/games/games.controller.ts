import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { map } from 'rxjs/operators';

import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) { }

  @Post()
  create(@Body() createGamePayload: unknown): unknown {
    return this.gamesService.create(createGamePayload).pipe(
      map(result => {
        // switch
      })
    );
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGameDto: unknown) {
    return this.gamesService.update(+id, updateGameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(+id);
  }
}
