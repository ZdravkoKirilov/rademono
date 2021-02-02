import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable } from 'rxjs';
import { ReadGameDto, UnexpectedError } from '@end/global';

import { toBadRequest, toUnexpectedError } from '@app/shared';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Body() createGamePayload: unknown): Observable<ReadGameDto> {
    return this.gamesService.create(createGamePayload).pipe(
      map((result) => {
        if (e.isLeft(result)) {
          switch (result.left.name) {
            case 'ParsingError': {
              throw toBadRequest({
                message: result.left.message,
                name: result.left.name,
                errors: result.left.errors,
              });
            }
            case 'UnexpectedError': {
              throw toUnexpectedError({
                message: result.left.message,
                name: result.left.name,
                originalError: result.left.error,
              });
            }
            default: {
              throw toUnexpectedError({
                message: 'Unexpected error',
                name: UnexpectedError.prototype.name,
                originalError: result.left,
              });
            }
          }
        } else {
          return result.right;
        }
      }),
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
