import { Injectable } from '@nestjs/common';
import { switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable } from 'rxjs';

import {
  AdminUserId,
  CreateAdminProfileDto,
  CreateProfileGroupDto,
  ParsingError,
  PrivateAdminProfile,
  PrivateOrganization,
  PrivateProfileGroup,
  toLeftObs,
  transformToClass,
  UnexpectedError,
} from '@end/global';
import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(private repo: OrganizationRepository) {}
  create(payload: unknown, userId: AdminUserId) {
    return PrivateOrganization.create(payload).pipe(
      switchMap(
        (
          mbDto,
        ): Observable<
          e.Either<ParsingError | UnexpectedError, Partial<PrivateOrganization>>
        > => {
          if (e.isLeft(mbDto)) {
            return toLeftObs(mbDto.left);
          }
          return this.repo.saveOrganization(mbDto.right);
        },
      ),
      switchMap((mbSaved) => {
        if (e.isLeft(mbSaved)) {
          return toLeftObs(mbSaved.left);
        }
        return PrivateProfileGroup.createFromDto(
          transformToClass(CreateProfileGroupDto, {
            name: 'Admins',
            description: 'Admin users',
            organization: mbSaved.right.public_id,
          }),
        );
      }),
      switchMap((mbGroup) => {
        if (e.isLeft(mbGroup)) {
          return toLeftObs(mbGroup.left);
        }
        return PrivateAdminProfile.createFromDto(
          transformToClass(CreateAdminProfileDto, {
            user: userId,
            group: mbGroup.right.public_id,
            name: 'Admin',
          }),
        );
      }),
    );
  }
}
