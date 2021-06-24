import { Injectable } from '@nestjs/common';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/Either';

import {
  mapEither,
  OrganizationId,
  ParsingError,
  Primitive,
  PrivateAsset,
  switchMapEither,
  toLeftObs,
  toRightObs,
  UnexpectedError,
} from '@end/global';
import { DbentityService } from '@app/database';

export type AssetDbModel = Primitive<PrivateAsset>;

@Injectable()
export class AssetRepository {
  constructor(private repo: DbentityService<AssetDbModel>) {}

  getAssets(
    organizationId: OrganizationId,
  ): Observable<e.Either<UnexpectedError | ParsingError, PrivateAsset[]>> {
    return this.repo.findAll({ organization: organizationId }).pipe(
      switchMapEither(
        (err) =>
          toLeftObs(
            new UnexpectedError('Failed to get assets from the db', err),
          ),
        (result) => {
          if (!result || result.length < 1) {
            return toRightObs([]);
          }
          return forkJoin(
            result.map((elem) => PrivateAsset.toPrivateEntity(elem)),
          ).pipe(
            map((results) => {
              if (results.every(e.isRight)) {
                return e.right(results.map((elem) => elem.right));
              }
              return e.left(
                new ParsingError(
                  'Failed to parse assets from db',
                  results.filter(e.isLeft).map((elem) => elem.left),
                ),
              );
            }),
          );
        },
      ),
    );
  }

  createAsset(
    asset: PrivateAsset,
  ): Observable<e.Either<UnexpectedError, PrivateAsset>> {
    return this.repo.insert(asset).pipe(
      mapEither(
        (err) => e.left(new UnexpectedError('Failed to create the asset', err)),
        () => e.right(asset),
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to create the asset', err),
        );
      }),
    );
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
