import { Inject, Injectable } from '@nestjs/common';

import {
  UserId,
  DomainError,
  Either,
  isLeft,
  isRight,
  left,
  map,
  Observable,
  of,
  Organization,
  ParsingError,
  PrivateOrganization,
  right,
  switchMap,
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
    userId: UserId,
  ): Observable<
    Either<UnexpectedError | DomainError | ParsingError, Organization>
  > {
    return PrivateOrganization.create(payload, this.createId, userId).pipe(
      switchMap((mbDto) => {
        if (isLeft(mbDto)) {
          return of(mbDto);
        }

        return this.repo.organizationExists({ name: mbDto.right.name }).pipe(
          map((res) => {
            if (isLeft(res)) {
              return res;
            }
            if (res.right) {
              return left(
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

  getAllForUser(
    userId: UserId,
  ): Observable<Either<UnexpectedError | ParsingError, Organization[]>> {
    return this.repo.getOrganizations(userId).pipe(
      map((mbOrgs) => {
        if (isRight(mbOrgs)) {
          return right(mbOrgs.right.map(PrivateOrganization.toPublicEntity));
        }
        return mbOrgs;
      }),
    );
  }
}
