import { Injectable } from '@nestjs/common';

import {
  Email,
  User,
  NanoId,
  UUIDv4,
  ParsingError,
  UnexpectedError,
  toLeftObs,
  switchMapEither,
  mapEither,
  Either,
  left,
  right,
  isNil,
  none,
  some,
  isRight,
  Option,
  Observable,
  map,
  catchError,
  of,
  Primitive,
} from '@end/global';
import { DbentityService } from '@app/database';

type UserDBModel = Primitive<User>;

type FindOneMatcher =
  | { email: Email }
  | { loginCode: NanoId }
  | { public_id: UUIDv4 };

@Injectable()
export class UserRepository {
  constructor(private repo: DbentityService<UserDBModel>) {}

  saveUser(updatedUser: User): Observable<Either<UnexpectedError, undefined>> {
    return this.repo.save(updatedUser).pipe(
      mapEither(
        (err) => left(new UnexpectedError('Failed to save the user', err)),
        () => {
          return right(undefined);
        },
      ),
      catchError((err) => {
        return toLeftObs(new UnexpectedError('Failed to save the user', err));
      }),
    );
  }

  findUser(
    criteria: FindOneMatcher,
  ): Observable<Either<UnexpectedError | ParsingError, Option<User>>> {
    return this.repo.findOne(criteria).pipe(
      switchMapEither(
        (err) => toLeftObs(new UnexpectedError('Failed to find the user', err)),
        (res) => {
          if (isNil(res)) {
            return of(right(none));
          }
          return User.toPrivateEntity(res).pipe(
            map((res) => {
              if (isRight(res)) {
                return right(some(res.right));
              }
              return res;
            }),
          );
        },
      ),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Failed to find the user', err)),
      ),
    );
  }

  findAll() {
    return this.repo.findAll();
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
