import { Inject, Injectable } from '@nestjs/common';
import { switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable, of } from 'rxjs';

import {
  Asset,
  isOrganizationId,
  isValidUrl,
  ParsingError,
  PrivateAsset,
  switchMapEither,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { AssetRepository } from './asset.repository';

@Injectable()
export class AssetService {
  constructor(
    private repo: AssetRepository,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}

  createImage(
    payload: unknown,
    organization: unknown,
    fileUrl: unknown,
  ): Observable<e.Either<UnexpectedError | ParsingError, Asset>> {
    if (!isOrganizationId(organization)) {
      return toLeftObs(new ParsingError('Valid organizationId is required'));
    }
    if (!isValidUrl(fileUrl)) {
      return toLeftObs(new ParsingError('Valid asset url is required'));
    }

    return PrivateAsset.createImage(payload, {
      organization,
      fileUrl,
      createId: this.createId,
    }).pipe(
      switchMap((mbDto) => {
        if (e.isLeft(mbDto)) {
          return of(mbDto);
        }

        return this.repo.createAsset(mbDto.right).pipe(
          switchMapEither(
            (err) =>
              toLeftObs(new UnexpectedError('Failed to save the asset', err)),
            (created) => toRightObs(PrivateAsset.toPublicEntity(created)),
          ),
        );
      }),
    );
  }
}
