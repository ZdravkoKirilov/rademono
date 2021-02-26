/*
1. has collections // departments
2. has profile groups // permission groups, teacher stuff
3. has game groups // school subjects
*/

import { Expose } from 'class-transformer';
import { IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import {
  parseAndValidateUnknown,
  transformToClass,
  transformToPlain,
} from '../parsers';
import { ProfileGroupId } from './ProfileGroup';

export type OrganizationId = Tagged<'OrganizationId', UUIDv4>;

class BasicFields {
  @Expose()
  @MinLength(1)
  @MaxLength(100)
  name: StringOfLength<1, 100>;

  @Expose()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  description?: StringOfLength<1, 5000>;
}

class ValidationBase extends BasicFields {
  @Expose()
  @IsUUID('4')
  admin_group: ProfileGroupId;
}
export class Organization extends ValidationBase {
  @Expose()
  @IsUUID('4')
  readonly id: OrganizationId;

  static fromUnknown(payload: unknown) {
    return parseAndValidateUnknown(payload, Organization);
  }
}

class CreateOrganizationDto extends BasicFields {}

export class PrivateOrganization extends ValidationBase {
  @Expose()
  @IsUUID('4')
  readonly public_id: OrganizationId;

  static create(
    payload: unknown,
    createId: typeof UUIDv4.generate,
  ): Observable<e.Either<ParsingError, InitialOrganization>> {
    return parseAndValidateUnknown(payload, CreateOrganizationDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: InitialOrganization = {
            ...result.right,
            public_id: createId(),
          };

          return e.right(transformToClass(PrivateOrganization, plain));
        }
        return result;
      }),
    );
  }

  static setAdminGroup(
    entity: InitialOrganization,
    adminGroupId: ProfileGroupId,
  ): PrivateOrganization {
    return transformToClass(PrivateOrganization, {
      ...transformToPlain(entity),
      admin_group: adminGroupId,
    });
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateOrganization);
  }

  static toPublicEntity(source: PrivateOrganization): Organization {
    return {
      id: source.public_id,
      name: source.name,
      admin_group: source.admin_group,
      description: source.description,
    };
  }
}

export type InitialOrganization = Omit<PrivateOrganization, 'admin_group'>;
