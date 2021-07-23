import { Injectable } from '@nestjs/common';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { isNil } from 'lodash/fp';

import {
  AssetId,
  DomainError,
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

type FindOneMatcher = { public_id: AssetId };

@Injectable()
export class AssetRepository {
  constructor(private repo: DbentityService<AssetDbModel>) {}

  getAssets(
    organizationId: OrganizationId,
  ): Observable<E.Either<UnexpectedError | ParsingError, PrivateAsset[]>> {
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
              if (results.every(E.isRight)) {
                return E.right(results.map((elem) => elem.right));
              }
              return E.left(
                new ParsingError(
                  'Failed to parse assets from db',
                  results.filter(E.isLeft).map((elem) => elem.left),
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
  ): Observable<E.Either<UnexpectedError, PrivateAsset>> {
    return this.repo.insert(asset).pipe(
      mapEither(
        (err) => E.left(new UnexpectedError('Failed to create the asset', err)),
        () => E.right(asset),
      ),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to create the asset', err),
        );
      }),
    );
  }

  getSingleAsset(
    matcher: FindOneMatcher,
  ): Observable<
    E.Either<UnexpectedError | ParsingError, O.Option<PrivateAsset>>
  > {
    return this.repo.findOne(matcher).pipe(
      switchMapEither(
        (err) =>
          toLeftObs(new UnexpectedError('Failed to find the asset', err)),
        (data) => {
          if (isNil(data)) {
            return toRightObs(O.none);
          }
          return PrivateAsset.toPrivateEntity(data).pipe(
            map((parsed) =>
              E.isLeft(parsed) ? parsed : E.right(O.some(parsed.right)),
            ),
          );
        },
      ),
    );
  }

  deleteAsset(
    matcher: FindOneMatcher,
  ): Observable<E.Either<UnexpectedError | DomainError, void>> {
    return this.repo.count(matcher).pipe(
      switchMap((assetCount) => {
        if (E.isLeft(assetCount)) {
          return of(assetCount);
        }
        if (assetCount.right === 0) {
          return toLeftObs(new DomainError('Asset not found'));
        }
        if (assetCount.right > 1) {
          return toLeftObs(new UnexpectedError('Multiple assets found'));
        }

        return this.repo.deleteOne(matcher).pipe(
          map((res) => {
            if (E.isLeft(res)) {
              return res;
            }
            if (res.right === 0) {
              return E.left(new UnexpectedError('Failed to delete asset'));
            }
            return E.right(undefined);
          }),
        );
      }),
    );
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
