import { Injectable } from '@nestjs/common';

import {
  UUIDv4,
  PrivateProfileGroup,
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
  isLeft,
  some,
  Option,
  Observable,
  catchError,
  map,
  switchMap,
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
  ): Observable<Either<UnexpectedError, PrivateProfileGroup>> {
    return this.repo.save(profileGroup).pipe(
      mapEither(
        (err) =>
          left(new UnexpectedError('Failed to save the profile group', err)),
        () => right(profileGroup),
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
    Either<UnexpectedError | ParsingError, Option<PrivateProfileGroup>>
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
              return toRightObs(none);
            }

            return PrivateProfileGroup.toPrivateEntity(res).pipe(
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
  ): Observable<Either<UnexpectedError, boolean>> {
    try {
      return this.repo.count(matcher).pipe(
        switchMap((count) => {
          return isLeft(count)
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
