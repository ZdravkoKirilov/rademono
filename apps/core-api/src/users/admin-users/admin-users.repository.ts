import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';

import {
  Email,
  PrivateAdminUser,
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
} from '@end/global';
import { DbentityService } from '@app/database';

type AdminUserDBModel = {
  id?: number;
  public_id: string;
  email?: string;
  loginCode?: string;
  loginCodeExpiration?: Date;
  lastLogin?: Date;
  type?: string;
};

type FindOneMatcher =
  | { email: Email }
  | { loginCode: NanoId }
  | { public_id: UUIDv4 };

@Injectable()
export class AdminUserRepository {
  constructor(private repo: DbentityService<AdminUserDBModel>) {}

  saveUser(
    updatedUser: PrivateAdminUser,
  ): Observable<Either<UnexpectedError, undefined>> {
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
  ): Observable<
    Either<UnexpectedError | ParsingError, Option<PrivateAdminUser>>
  > {
    return this.repo.findOne(criteria).pipe(
      switchMapEither(
        (err) => toLeftObs(new UnexpectedError('Failed to find the user', err)),
        (res) => {
          if (isNil(res)) {
            return of(right(none));
          }
          return PrivateAdminUser.toPrivateEntity(res).pipe(
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
