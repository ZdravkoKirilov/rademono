import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';

import { GamesService } from './games.service';
import { Observable } from 'rxjs';
import {
  CustomHttpException,
  ReadGameDto,
  toHttpException,
  UnexpectedError,
} from '@end/global';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(
    @Body() createGamePayload: unknown,
  ): Observable<ReadGameDto | CustomHttpException> {
    return this.gamesService.create(createGamePayload).pipe(
      map((result) => {
        if (e.isLeft(result)) {
          switch (result.left.name) {
            case 'MalformedPayload':
              return toHttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: result.left.message,
                name: result.left.name,
              });
            case 'ParsingError': {
              return toHttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: result.left.message,
                name: result.left.name,
                errors: result.left.errors,
              });
            }
            case 'UnexpectedError': {
              return toHttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: result.left.message,
                name: result.left.name,
              });
            }
            default: {
              return toHttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Unexpected error',
                name: UnexpectedError.prototype.name,
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
