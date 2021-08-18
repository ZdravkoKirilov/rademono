import { Inject, Injectable } from '@nestjs/common';
import { switchMap, tap } from 'rxjs/operators';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { Observable, of } from 'rxjs';

import {
  Asset,
  DomainError,
  isAssetId,
  isFilePath,
  isOrganizationId,
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
import { FileService } from './file.service';

@Injectable()
export class AssetService {
  constructor(
    private repo: AssetRepository,
    private fileService: FileService,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}

  deleteAsset(
    id: string,
    organization: string,
  ): Observable<E.Either<UnexpectedError | ParsingError | DomainError, void>> {
    if (!isOrganizationId(organization)) {
      return toLeftObs(new ParsingError('Valid organizationId is required'));
    }

    if (!isAssetId(id)) {
      return toLeftObs(new ParsingError('Valid assetId is required'));
    }

    const matcher = { public_id: id };

    return this.repo.getSingleAsset(matcher).pipe(
      switchMap((mbAsset) => {
        if (E.isLeft(mbAsset)) {
          return toLeftObs(mbAsset.left);
        }
        if (O.isNone(mbAsset.right)) {
          return toLeftObs(new DomainError('Asset not found'));
        }

        const asset = mbAsset.right.value;

        return this.repo.deleteAsset(matcher).pipe(
          tap(() => {
            this.fileService.deleteFile(asset.path);
          }),
        );
      }),
    );
  }

  createImage(
    payload: unknown,
    organization: string,
    fileUrl: string,
  ): Observable<E.Either<UnexpectedError | ParsingError, Asset>> {
    if (!isOrganizationId(organization)) {
      return toLeftObs(new ParsingError('Valid organizationId is required'));
    }
    if (!isFilePath<['jpg', 'png']>(fileUrl, ['jpg', 'png'])) {
      return toLeftObs(new ParsingError('Valid asset url is required'));
    }

    return PrivateAsset.createImage(payload, {
      organization,
      filePath: fileUrl,
      createId: this.createId,
    }).pipe(
      switchMap((mbDto) => {
        if (E.isLeft(mbDto)) {
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
