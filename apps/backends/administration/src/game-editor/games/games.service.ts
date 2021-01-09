import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
import { isLeft, Either, left, right } from 'fp-ts/lib/Either';

import { GameId, GameParser, MalformedPayloadError, ParsingError, UnexpectedError } from '@end/global';

import { GameDBModel } from './game.db.model';

@Injectable()
export class GamesService {

  constructor(
    @InjectRepository(GameDBModel)
    private gamesRepository: Repository<GameDBModel>,
  ) { }

  create(payload: unknown): Observable<Either<UnexpectedError | MalformedPayloadError | ParsingError, GameId>> {
    return GameParser.toCreateDto(payload).pipe(
      switchMap((res) => {
        if (isLeft(res)) {
          return of(res);
        }
        return from(
          this.gamesRepository.save(res.right))
          .pipe(
            map(instertedGame => {
              return right(instertedGame.public_id as GameId);
            }),
            catchError(err => of(left(new UnexpectedError('Failed to save the game', err))))
          )
      })
    )
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
