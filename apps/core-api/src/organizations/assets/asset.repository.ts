import { Injectable } from '@nestjs/common';

import {
  AssetId,
  DomainError,
  Either,
  isLeft,
  isNil,
  isRight,
  left,
  mapEither,
  none,
  OrganizationId,
  ParsingError,
  Primitive,
  PrivateAsset,
  right,
  some,
  switchMapEither,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  Option,
  Observable,
  forkJoin,
  map,
  catchError,
  switchMap,
  of,
} from '@end/global';
import { DbentityService } from '@app/database';

export type AssetDbModel = Primitive<PrivateAsset>;

type FindOneMatcher = { public_id: AssetId };

@Injectable()
export class AssetRepository {
  constructor(private repo: DbentityService<AssetDbModel>) {}

  getAssets(
    organizationId: OrganizationId,
  ): Observable<Either<UnexpectedError | ParsingError, PrivateAsset[]>> {
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
              if (results.every(isRight)) {
                return right(results.map((elem) => elem.right));
              }
              return left(
                new ParsingError(
                  'Failed to parse assets from db',
                  results.filter(isLeft).map((elem) => elem.left),
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
  ): Observable<Either<UnexpectedError, PrivateAsset>> {
    return this.repo.insert(asset).pipe(
      mapEither(
        (err) => left(new UnexpectedError('Failed to create the asset', err)),
        () => right(asset),
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
  ): Observable<Either<UnexpectedError | ParsingError, Option<PrivateAsset>>> {
    return this.repo.findOne(matcher).pipe(
      switchMapEither(
        (err) =>
          toLeftObs(new UnexpectedError('Failed to find the asset', err)),
        (data) => {
          if (isNil(data)) {
            return toRightObs(none);
          }
          return PrivateAsset.toPrivateEntity(data).pipe(
            map((parsed) =>
              isLeft(parsed) ? parsed : right(some(parsed.right)),
            ),
          );
        },
      ),
    );
  }

  deleteAsset(
    matcher: FindOneMatcher,
  ): Observable<Either<UnexpectedError | DomainError, void>> {
    return this.repo.count(matcher).pipe(
      switchMap((assetCount) => {
        if (isLeft(assetCount)) {
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
            if (isLeft(res)) {
              return res;
            }
            if (res.right === 0) {
              return left(new UnexpectedError('Failed to delete asset'));
            }
            return right(undefined);
          }),
        );
      }),
    );
  }

  deleteAll() {
    return this.repo.deleteAll();
  }
}
