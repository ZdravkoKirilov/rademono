import {
  OrganizationId,
  PrivateAdminGroup,
  PrivateProfileGroup,
  PrivateCollection,
  switchMapEither,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  ParsingError,
  mapEither,
} from '@end/global';
import { Injectable } from '@nestjs/common';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/Either';

import { DbentityService } from '@app/database';

export type CollectionDBModel = {
  public_id: string;
  name: string;
  description?: string;

  admin_group?: PrivateAdminGroup;
  profile_group?: PrivateProfileGroup;
  games?: string[];
  children?: string[];
};

@Injectable()
export class CollectionRepository {
  constructor(private repo: DbentityService<CollectionDBModel>) {}

  getCollections(
    organizationId: OrganizationId,
  ): Observable<e.Either<UnexpectedError | ParsingError, PrivateCollection[]>> {
    return this.repo.findAll({ organization: organizationId }).pipe(
      switchMapEither(
        (err) =>
          toLeftObs(
            new UnexpectedError('Failed to get collections from the db', err),
          ),
        (result) => {
          if (!result || result.length < 1) {
            return toRightObs([]);
          }
          return forkJoin(
            result.map((elem) => PrivateCollection.toPrivateEntity(elem)),
          ).pipe(
            map((results) => {
              if (results.every(e.isRight)) {
                return e.right(results.map((elem) => elem.right));
              }
              return e.left(
                new ParsingError(
                  'Failed to parse collections from db',
                  results.filter(e.isLeft).map((elem) => elem.left),
                ),
              );
            }),
          );
        },
      ),
    );
  }

  createCollection(
    collection: PrivateCollection,
  ): Observable<e.Either<UnexpectedError, PrivateCollection>> {
    return this.repo.insert(collection).pipe(
      mapEither(
        (err) =>
          e.left(new UnexpectedError('Failed to create the collection', err)),
        () => e.right(collection),
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to create the collection', err),
        );
      }),
    );
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
