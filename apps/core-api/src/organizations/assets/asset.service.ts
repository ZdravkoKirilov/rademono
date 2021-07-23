import { Inject, Injectable } from '@nestjs/common';
import { switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable, of } from 'rxjs';
import fs from 'fs';
import path from 'path';

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

@Injectable()
export class AssetService {
  constructor(
    private repo: AssetRepository,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}

  deleteAsset(
    id: string,
    organization: string,
  ): Observable<e.Either<UnexpectedError | ParsingError | DomainError, void>> {
    if (!isOrganizationId(organization)) {
      return toLeftObs(new ParsingError('Valid organizationId is required'));
    }

    if (!isAssetId(id)) {
      return toLeftObs(new ParsingError('Valid assetId is required'));
    }
    return this.repo.deleteAsset({ public_id: id });
  }

  deleteFile(fileName: string) {
    const basePath = path.join(__dirname, '../../..');
    return new Promise((resolve, reject) => {
      fs.unlink(basePath + 'uploads/' + fileName, (err) => {
        if (err) {
          console.log('Failed to delete the file. ', err);
          reject(err);
        }
        console.log('File deleted: ' + fileName);
        resolve(undefined);
      });
    });
  }

  createImage(
    payload: unknown,
    organization: string,
    fileUrl: string,
  ): Observable<e.Either<UnexpectedError | ParsingError, Asset>> {
    if (!isOrganizationId(organization)) {
      return toLeftObs(new ParsingError('Valid organizationId is required'));
    }
    if (!isFilePath<['jpg', 'png']>(fileUrl, ['jpg', 'png'])) {
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
