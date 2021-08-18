import { Inject, Injectable } from '@nestjs/common';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  Collection,
  Either,
  isLeft,
  isOrganizationId,
  isRight,
  ParsingError,
  PrivateCollection,
  right,
  switchMapEither,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { CollectionRepository } from './collection.repository';

@Injectable()
export class CollectionService {
  constructor(
    private repo: CollectionRepository,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}

  create(
    payload: unknown,
    organization: unknown,
  ): Observable<Either<UnexpectedError | ParsingError, Collection>> {
    if (!isOrganizationId(organization)) {
      return toLeftObs(new ParsingError('Valid organizationId is required'));
    }
    return PrivateCollection.create(payload, this.createId, organization).pipe(
      switchMap((mbDto) => {
        if (isLeft(mbDto)) {
          return of(mbDto);
        }

        return this.repo.createCollection(mbDto.right).pipe(
          switchMapEither(
            (err) =>
              toLeftObs(
                new UnexpectedError('Failed to save the collection', err),
              ),
            (created) => toRightObs(PrivateCollection.toPublicEntity(created)),
          ),
        );
      }),
    );
  }

  getAll(
    organizationId: unknown,
  ): Observable<Either<UnexpectedError | ParsingError, Collection[]>> {
    if (!isOrganizationId(organizationId)) {
      return toLeftObs(new ParsingError('Valid organizationId is required'));
    }
    return this.repo.getCollections(organizationId).pipe(
      map((res) => {
        if (isRight(res)) {
          return right(res.right.map(PrivateCollection.toPublicEntity));
        }
        return res;
      }),
    );
  }
}
