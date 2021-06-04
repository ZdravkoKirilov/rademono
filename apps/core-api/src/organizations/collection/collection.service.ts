import { Inject, Injectable } from '@nestjs/common';
import { map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable, of } from 'rxjs';

import {
  Collection,
  DomainError,
  OrganizationId,
  ParsingError,
  PrivateCollection,
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
    organization: OrganizationId,
  ): Observable<
    e.Either<UnexpectedError | DomainError | ParsingError, Collection>
  > {
    return PrivateCollection.create(payload, this.createId, organization).pipe(
      switchMap((mbDto) => {
        if (e.isLeft(mbDto)) {
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

  getAll(organizationId: OrganizationId) {
    return this.repo.getCollections(organizationId).pipe(
      map((res) => {
        if (e.isRight(res)) {
          return e.right(res.right.map(PrivateCollection.toPublicEntity));
        }
        return res;
      }),
    );
  }
}
