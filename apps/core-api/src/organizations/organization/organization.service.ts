import { Inject, Injectable } from '@nestjs/common';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable, of } from 'rxjs';

import {
  AdminUserId,
  CreateOrganizationResponse,
  DomainError,
  ParsingError,
  PrivateOrganization,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { OrganizationRepository } from './organization.repository';
import { ProfileGroupService } from '../profile-group';
import { AdminProfileService } from '../admin-profile';

@Injectable()
export class OrganizationService {
  constructor(
    private repo: OrganizationRepository,
    private profileGroupService: ProfileGroupService,
    private adminProfileService: AdminProfileService,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}

  create2(
    payload: unknown,
    userId: AdminUserId,
  ): Observable<
    e.Either<UnexpectedError | DomainError | ParsingError, PrivateOrganization>
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

        return toRightObs(mbCreated.right);
      }),
    );
  }

  create(
    payload: unknown,
    userId: AdminUserId,
  ): Observable<
    e.Either<
      UnexpectedError | DomainError | ParsingError,
      CreateOrganizationResponse
    >
  > {
    return PrivateOrganization.create(payload, this.createId).pipe(
      switchMap(
        (
          mbDto,
        ): Observable<
          e.Either<
            UnexpectedError | ParsingError | DomainError,
            InitialOrganization
          >
        > => {
          if (e.isLeft(mbDto)) {
            return toLeftObs(mbDto.left);
          }
          return this.repo.organizationExists({ name: mbDto.right.name }).pipe(
            switchMap((mbOrganization) => {
              if (e.isLeft(mbOrganization)) {
                return toLeftObs(mbOrganization.left);
              }
              if (mbOrganization.right) {
                return toLeftObs(
                  new DomainError('Organization with that name already exists'),
                );
              }

              return this.repo.createOrganization(mbDto.right).pipe(
                map((res) =>
                  e.isLeft(res)
                    ? e.left(
                        new UnexpectedError(
                          'repo.createOrganization failed.',
                          res.left,
                        ),
                      )
                    : res,
                ),
                catchError((err) => {
                  return toLeftObs(err as any);
                }),
              );
            }),
          );
        },
      ),
      switchMap((mbSaved) => {
        if (e.isLeft(mbSaved)) {
          return toLeftObs(mbSaved.left);
        }
        return this.profileGroupService
          .create({
            name: 'Admins',
            description: 'Admin users',
            organization: mbSaved.right.public_id,
          })
          .pipe(
            switchMap((mbGroup) => {
              if (e.isLeft(mbGroup)) {
                return toLeftObs(mbGroup.left);
              }
              return this.adminProfileService
                .create({
                  user: userId,
                  group: mbGroup.right.id,
                  name: 'Admin',
                })
                .pipe(
                  switchMap((mbProfile) => {
                    if (e.isLeft(mbProfile)) {
                      return toLeftObs(mbProfile.left);
                    }
                    return this.repo
                      .saveOrganization(
                        PrivateOrganization.setAdminGroup(
                          mbSaved.right,
                          mbGroup.right.id,
                        ),
                      )
                      .pipe(
                        map((mbUpdatedOrganization) => {
                          if (e.isLeft(mbUpdatedOrganization)) {
                            return mbUpdatedOrganization;
                          }

                          const organization = PrivateOrganization.toPublicEntity(
                            mbUpdatedOrganization.right,
                          );
                          return e.right({
                            organization,
                            group: mbGroup.right,
                            profile: mbProfile.right,
                          });
                        }),
                      );
                  }),
                );
            }),
          );
      }),
      catchError((err) =>
        toLeftObs(
          new UnexpectedError(
            'Unexpected error while creating a new organization',
            err,
          ),
        ),
      ),
    );
  }

  getAllForUser(userId: AdminUserId) {}
}
