import { Injectable } from '@nestjs/common';

import {
  UUIDv4,
  PrivateAdminProfile,
  toLeftObs,
  UnexpectedError,
  toRightObs,
  ParsingError,
  mapEither,
  switchMapEither,
  Either,
  left,
  right,
  isNil,
  none,
  isRight,
  some,
  Option,
  Observable,
  catchError,
  from,
  map,
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
  ): Observable<Either<UnexpectedError, PrivateAdminProfile>> {
    return this.repo.save(adminProfile).pipe(
      mapEither(
        (err) =>
          left(new UnexpectedError('Failed to save the admin profile', err)),
        () => right(adminProfile),
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
    Either<UnexpectedError | ParsingError, Option<PrivateAdminProfile>>
  > {
    return from(this.repo.findOne(matcher)).pipe(
      switchMapEither(
        (err) =>
          toLeftObs(new UnexpectedError('Failed to find the profile', err)),
        (res) => {
          if (isNil(res)) {
            return toRightObs(none);
          }

          return PrivateAdminProfile.toPrivateEntity(res).pipe(
            map((parsed) => {
              if (isRight(parsed)) {
                return right(some(parsed.right));
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
  ): Observable<Either<UnexpectedError, boolean>> {
    return this.repo.count(matcher).pipe(
      mapEither(
        (err) => {
          return left(err);
        },
        (res) => {
          return right(res > 0);
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
