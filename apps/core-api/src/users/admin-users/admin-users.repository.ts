import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { isNil } from 'lodash/fp';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

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
} from '@end/global';
import { DbentityService } from '@app/database';
import { Injectable } from '@nestjs/common';

type AdminUserDBModel = {
  id?: number;
  public_id: string;
  email?: string;
  loginCode?: string;
  loginCodeExpiration?: Date;
  lastLogin?: Date;
  type?: string;
};

type UpdateOneMatcher = { public_id: UUIDv4 };

type FindOneMatcher =
  | { email: Email }
  | { loginCode: NanoId }
  | { public_id: UUIDv4 };

@Injectable()
export class AdminUserRepository {
  constructor(private repo: DbentityService<AdminUserDBModel>) {}

  saveUser(
    updatedUser: PrivateAdminUser,
  ): Observable<e.Either<UnexpectedError, undefined>> {
    return this.repo.save(updatedUser).pipe(
      mapEither(
        (err) => e.left(new UnexpectedError('Failed to save the user', err)),
        () => {
          return e.right(undefined);
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
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateAdminUser>>
  > {
    return this.repo.findOne(criteria).pipe(
      switchMapEither(
        (err) => toLeftObs(new UnexpectedError('Failed to find the user', err)),
        (res) => {
          if (isNil(res)) {
            return of(e.right(o.none));
          }
          return PrivateAdminUser.toPrivateEntity(res).pipe(
            map((res) => {
              if (e.isRight(res)) {
                return e.right(o.some(res.right));
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
