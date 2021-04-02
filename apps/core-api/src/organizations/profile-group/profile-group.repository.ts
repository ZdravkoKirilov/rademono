import { Injectable } from '@nestjs/common';
import { switchMap, catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { isNil } from 'lodash/fp';

import {
  UUIDv4,
  PrivateProfileGroup,
  toLeftObs,
  UnexpectedError,
  toRightObs,
  ParsingError,
  mapEither,
  switchMapEither,
} from '@end/global';
import { DbentityService } from '@app/database';

export type ProfileGroupDBModel = {
  id?: number;
  public_id: string;
  organization?: string;
  name?: string;
  description?: string;
};

type FindOneMatcher =
  | { public_id: UUIDv4 }
  | { name: string; organization: string };

@Injectable()
export class ProfileGroupRepository {
  constructor(public repo: DbentityService<ProfileGroupDBModel>) {}

  saveProfileGroup(
    profileGroup: PrivateProfileGroup,
  ): Observable<e.Either<UnexpectedError, PrivateProfileGroup>> {
    return this.repo.save(profileGroup).pipe(
      mapEither(
        (err) =>
          e.left(new UnexpectedError('Failed to save the profile group', err)),
        () => e.right(profileGroup),
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to save the profile group', err),
        );
      }),
    );
  }

  getProfileGroup(
    matcher: FindOneMatcher,
  ): Observable<
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateProfileGroup>>
  > {
    try {
      return this.repo.findOne(matcher).pipe(
        switchMapEither(
          (err) =>
            toLeftObs(
              new UnexpectedError('Failed to find the profile group', err),
            ),
          (res) => {
            if (isNil(res)) {
              return toRightObs(o.none);
            }

            return PrivateProfileGroup.toPrivateEntity(res).pipe(
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
            new UnexpectedError('Failed to find the profile group', err),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError('Failed to find the profile group', err),
      );
    }
  }

  groupExists(
    matcher: FindOneMatcher,
  ): Observable<e.Either<UnexpectedError, boolean>> {
    try {
      return this.repo.count(matcher).pipe(
        switchMap((count) => {
          return e.isLeft(count)
            ? toLeftObs(count.left)
            : toRightObs(count.right > 0);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError(
              'Failed to find whether the profile group exists',
              err,
            ),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError(
          'Failed to find whether the profile group exists',
          err,
        ),
      );
    }
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
