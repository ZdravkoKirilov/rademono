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
  Either,
  isRight,
  right,
  left,
  isLeft,
  Observable,
  map,
  forkJoin,
  catchError,
} from '@end/global';
import { Injectable } from '@nestjs/common';

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
  ): Observable<Either<UnexpectedError | ParsingError, PrivateCollection[]>> {
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
              if (results.every(isRight)) {
                return right(results.map((elem) => elem.right));
              }
              return left(
                new ParsingError(
                  'Failed to parse collections from db',
                  results.filter(isLeft).map((elem) => elem.left),
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
  ): Observable<Either<UnexpectedError, PrivateCollection>> {
    return this.repo.insert(collection).pipe(
      mapEither(
        (err) =>
          left(new UnexpectedError('Failed to create the collection', err)),
        () => right(collection),
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
