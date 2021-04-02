import { Injectable } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { isNil } from 'lodash/fp';

import {
  UUIDv4,
  PrivateAdminProfile,
  toLeftObs,
  UnexpectedError,
  toRightObs,
  ParsingError,
  mapEither,
  switchMapEither,
} from '@end/global';
import { DbentityService } from '@app/database';

type AdminProfileDBModel = {
  id?: number;
  public_id: string;
  user?: string;
  group?: string;
  name?: string;
};

type FindOneMatcher = { public_id: UUIDv4 } | { user: string; group: string };

@Injectable()
export class AdminProfileRepository {
  constructor(public repo: DbentityService<AdminProfileDBModel>) {}

  saveProfile(
    adminProfile: PrivateAdminProfile,
  ): Observable<e.Either<UnexpectedError, PrivateAdminProfile>> {
    return this.repo.save(adminProfile).pipe(
      mapEither(
        (err) =>
          e.left(new UnexpectedError('Failed to save the admin profile', err)),
        () => e.right(adminProfile),
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to save the admin profile', err),
        );
      }),
    );
  }

  getProfile(
    matcher: FindOneMatcher,
  ): Observable<
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateAdminProfile>>
  > {
    return from(this.repo.findOne(matcher)).pipe(
      switchMapEither(
        (err) =>
          toLeftObs(new UnexpectedError('Failed to find the profile', err)),
        (res) => {
          if (isNil(res)) {
            return toRightObs(o.none);
          }

          return PrivateAdminProfile.toPrivateEntity(res).pipe(
            map((parsed) => {
              if (e.isRight(parsed)) {
                return e.right(o.some(parsed.right));
              }
              return parsed;
            }),
          );
        },
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to find the profile', err),
        );
      }),
    );
  }

  profileExists(
    matcher: FindOneMatcher,
  ): Observable<e.Either<UnexpectedError, boolean>> {
    return this.repo.count(matcher).pipe(
      mapEither(
        (err) => {
          return e.left(err);
        },
        (res) => {
          return e.right(res > 0);
        },
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to find whether the profile exists', err),
        );
      }),
    );
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
