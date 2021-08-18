import { Injectable } from '@nestjs/common';
import { switchMap, catchError, map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { isNil } from 'lodash/fp';

import {
  UUIDv4,
  PrivateOrganization,
  toLeftObs,
  UnexpectedError,
  toRightObs,
  ParsingError,
  switchMapEither,
  mapEither,
  PrivateAdminGroup,
  AdminUserId,
} from '@end/global';

import { DbentityService } from '@app/database';

export class OrganizationDBModel {
  id?: number;
  public_id: string;
  admin_group: PrivateAdminGroup;
  name: string;
  description?: string;
}

type FindOneMatcher = { public_id: UUIDv4 } | { name: string };

@Injectable()
export class OrganizationRepository {
  constructor(private repo: DbentityService<OrganizationDBModel>) {}

  getOrganizations(
    userId: AdminUserId,
  ): Observable<
    e.Either<ParsingError | UnexpectedError, PrivateOrganization[]>
  > {
    const query = { 'admin_group.profiles': { $elemMatch: { user: userId } } };

    return this.repo.findAll(query).pipe(
      switchMapEither(
        (error) => {
          return toLeftObs(
            new UnexpectedError('Failed to find the organizations', error),
          );
        },
        (result) => {
          if (!result || result.length < 1) {
            return toRightObs([]);
          }
          return forkJoin(
            result.map((elem) => PrivateOrganization.toPrivateEntity(elem)),
          ).pipe(
            map((results) => {
              if (results.every(e.isRight)) {
                return e.right(results.map((elem) => elem.right));
              }
              return e.left(
                new ParsingError(
                  'Failed to parse organizations',
                  results.filter(e.isLeft).map((elem) => elem.left),
                ),
              );
            }),
          );
        },
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to find the organizations', err),
        );
      }),
    );
  }

  /*   getOrganization2(
    userId: AdminUserId,
  ): Observable<
    e.Either<ParsingError | UnexpectedError, PrivateOrganization[]>
  > {
    return this.repo
      .query<PrivateOrganization[]>((connection) => {
        return from(
          connection
            .collection('admin-profiles')
            .aggregate([
              {
                $match: { user: userId },
              },
              {
                $lookup: {
                  from: 'profile-groups',
                  localField: 'group',
                  foreignField: 'public_id',
                  as: 'groups',
                },
              },
              { $unwind: '$groups' },
              {
                $lookup: {
                  from: 'organizations',
                  as: 'organizations',
                  localField: 'groups.organization',
                  foreignField: 'public_id',
                },
              },
              {
                $replaceRoot: {
                  newRoot: { $arrayElemAt: ['$organizations', 0] },
                },
              },
            ])
            .toArray(),
        );
      })
      .pipe(
        switchMap((res) => {
          return parseAndValidateManyUnknown(res, PrivateOrganization);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError('Failed to retrieve organizations', err),
          );
        }),
      );
  } */

  createOrganization(
    organization: PrivateOrganization,
  ): Observable<e.Either<UnexpectedError, PrivateOrganization>> {
    try {
      return this.repo.insert(organization).pipe(
        mapEither(
          (err) =>
            e.left(
              new UnexpectedError('Failed to create the organization', err),
            ),
          () => e.right(organization),
        ),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError('Failed to create the organization', err),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError('Failed to create the organization', err),
      );
    }
  }

  saveOrganization(
    updatedOrganization: PrivateOrganization,
  ): Observable<e.Either<UnexpectedError, PrivateOrganization>> {
    try {
      return this.repo.save(updatedOrganization).pipe(
        mapEither(
          (err) =>
            e.left(new UnexpectedError('Failed to save the organization', err)),
          () => e.right(updatedOrganization),
        ),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError('Failed to save the organization', err),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError('Failed to save the organization', err),
      );
    }
  }

  organizationExists(
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
              'Failed to find whether the organization exists',
              err,
            ),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError(
          'Failed to find whether the organization exists',
          err,
        ),
      );
    }
  }

  getOrganization(
    matcher: FindOneMatcher,
  ): Observable<
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateOrganization>>
  > {
    return this.repo.findOne(matcher).pipe(
      switchMapEither(
        (err) =>
          toLeftObs(
            new UnexpectedError('Failed to find the organization', err),
          ),
        (res) => {
          if (isNil(res)) {
            return toRightObs(o.none);
          }

          return PrivateOrganization.toPrivateEntity(res).pipe(
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
          new UnexpectedError('Failed to find the organization', err),
        );
      }),
    );
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
