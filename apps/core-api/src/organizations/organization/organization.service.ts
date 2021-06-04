import { Inject, Injectable } from '@nestjs/common';
import { map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable, of } from 'rxjs';

import {
  AdminUserId,
  DomainError,
  Organization,
  ParsingError,
  PrivateOrganization,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(
    private repo: OrganizationRepository,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}

  create(
    payload: unknown,
    userId: AdminUserId,
  ): Observable<
    e.Either<UnexpectedError | DomainError | ParsingError, Organization>
  > {
    return PrivateOrganization.create(payload, this.createId, userId).pipe(
      switchMap((mbDto) => {
        if (e.isLeft(mbDto)) {
          return of(mbDto);
        }

        return this.repo.organizationExists({ name: mbDto.right.name }).pipe(
          map((res) => {
            if (e.isLeft(res)) {
              return res;
            }
            if (res.right) {
              return e.left(
                new DomainError('Organization with that name already exists'),
              );
            }
            return mbDto;
          }),
        );
      }),
      switchMap((payload) => {
        if ('left' in payload) {
          return toLeftObs(payload.left);
        }

        return this.repo.createOrganization(payload.right);
      }),
      switchMap((mbCreated) => {
        if ('left' in mbCreated) {
          return toLeftObs(mbCreated.left);
        }

        return toRightObs(PrivateOrganization.toPublicEntity(mbCreated.right));
      }),
    );
  }

  getAllForUser(userId: AdminUserId) {
    return this.repo.getOrganizations(userId).pipe(
      map((mbOrgs) => {
        if (e.isRight(mbOrgs)) {
          return e.right(mbOrgs.right.map(PrivateOrganization.toPublicEntity));
        }
        return mbOrgs;
      }),
    );
  }
}
