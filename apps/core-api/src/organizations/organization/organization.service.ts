import { Inject, Injectable } from '@nestjs/common';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable } from 'rxjs';

import {
  AdminProfile,
  AdminUserId,
  DomainError,
  InitialOrganization,
  Organization,
  ParsingError,
  PrivateOrganization,
  ProfileGroup,
  toLeftObs,
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
  create(
    payload: unknown,
    userId: AdminUserId,
  ): Observable<
    e.Either<
      UnexpectedError | DomainError | ParsingError,
      {
        organization: Organization;
        group: ProfileGroup;
        profile: AdminProfile;
      }
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

              return this.repo
                .createOrganization(mbDto.right)
                .pipe(
                  map((res) =>
                    e.isLeft(res) ? e.left(new UnexpectedError('')) : res,
                  ),
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
}
