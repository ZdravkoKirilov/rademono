import { Injectable } from '@nestjs/common';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import {
  GameParser,
  ParsingError,
  ReadGameDto,
  toLeftObs,
  UnexpectedError,
} from '@end/global';
import { GameRepository } from './game.repository';

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GameRepository) {}

  create(
    payload: unknown,
  ): Observable<e.Either<UnexpectedError | ParsingError, ReadGameDto>> {
    return GameParser.toCreateDto(payload).pipe(
      switchMap((res) => {
        if (e.isLeft(res)) {
          return of(res);
        }
        return from(this.gamesRepository.createNew(res.right)).pipe(
          map((result) => {
            if (e.isLeft(result)) {
              return e.left(
                new UnexpectedError('Failed to save the game', result.left),
              );
            } else {
              return e.right(GameParser.toReadDto(result.right));
            }
          }),
        );
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Failed to save the game', err)),
      ),
    );
  }

  findAll() {
    return `This action returns all games`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updatePayload: unknown) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
