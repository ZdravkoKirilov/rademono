/*
1. has collections // departments
2. has profile groups // permission groups, teacher stuff
3. has game groups // school subjects
*/

import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  isUUID,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, UUIDv4, Tagged } from '../types';
import { parseAndValidateUnknown, transformToClass } from '../parsers';
import {
  AdminGroup,
  CreateAdminGroupDto,
  PrivateAdminGroup,
} from './AdminGroup';
import { UserId } from 'src/user-entities';
import { CreateAdminProfileDto, PrivateAdminProfile } from './AdminProfile';

export type OrganizationId = Tagged<'OrganizationId', UUIDv4>;

export const isOrganizationId = (value: unknown): value is OrganizationId =>
  isUUID(value);

class BasicFields {
  @Expose()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  name: StringOfLength<1, 100>;

  @Expose()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  description?: StringOfLength<1, 5000>;
}

export class Organization extends BasicFields {
  @Expose()
  @IsUUID('4')
  readonly id: OrganizationId;

  @Expose()
  @ValidateNested()
  @Type(() => AdminGroup)
  admin_group: AdminGroup;

  static create(payload: unknown) {
    return parseAndValidateUnknown(payload, CreateOrganizationDto);
  }
}

export class CreateOrganizationDto extends BasicFields {}

export class PrivateOrganization extends BasicFields {
  @Expose()
  @IsUUID('4')
  readonly public_id: OrganizationId;

  @Expose()
  @IsObject()
  @ValidateNested()
  @Type(() => PrivateAdminGroup)
  admin_group: PrivateAdminGroup;

  static create(
    payload: unknown,
    createId: () => OrganizationId,
    userId: UserId,
  ): Observable<e.Either<ParsingError, PrivateOrganization>> {
    const organizationId = createId();

    const group = PrivateAdminGroup.createFromDto(
      transformToClass(CreateAdminGroupDto, {
        name: 'Admins',
        organization: organizationId,
      }),
      () => organizationId as any,
    );

    const adminProfile = PrivateAdminProfile.createFromDto(
      transformToClass(CreateAdminProfileDto, {
        user: userId,
        name: 'Admin',
        group: group.public_id,
      }),
      () => organizationId as any,
    );

    const groupWithProfile = PrivateAdminGroup.addProfile(group, adminProfile);

    return parseAndValidateUnknown(payload, CreateOrganizationDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain = {
            ...result.right,
            public_id: organizationId,
            admin_group: groupWithProfile,
          };

          return e.right(transformToClass(PrivateOrganization, plain));
        }
        return result;
      }),
    );
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateOrganization);
  }

  static toPublicEntity(source: PrivateOrganization): Organization {
    return {
      id: source.public_id,
      name: source.name,
      admin_group: PrivateAdminGroup.toPublicEntity(source.admin_group),
      description: source.description,
    };
  }
}
