import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';

import {
  CreateGameDto,
  FullGame,
  GameParser,
  ParsingError,
  toLeftObs,
  UnexpectedError,
} from '@end/global';
import { DbentityService } from '@app/database';

type GameDBModel = {
  id?: number;
  public_id: string;
  title?: string;
  description?: string;
  image?: string;
};

@Injectable()
export class GameRepository {
  constructor(private repo: DbentityService<GameDBModel>) {}

  createNew(
    dto: CreateGameDto,
  ): Observable<e.Either<UnexpectedError | ParsingError, FullGame>> {
    return this.repo.insert(dto as any /* TODO: PrivateGame */).pipe(
      switchMap((res) => {
        if (e.isLeft(res)) {
          return toLeftObs(new UnexpectedError('DB save failed', res.left));
        }

        return GameParser.toFullEntity({
          ...res.right,
          id: res.right.public_id,
        });
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('DB save failed', err)),
      ),
    );
  }
}
