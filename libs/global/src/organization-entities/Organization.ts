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
export class Organization {
  @Expose()
  readonly id: OrganizationId;

  @Expose()
  name: StringOfLength<1, 100>;

  @Expose()
  description: StringOfLength<1, 5000>;

  @Expose()
  admin_group_id: ProfileGroupId;
}

class CreateOrganizationDto {
  @Expose()
  @MinLength(1)
  @MaxLength(100)
  name: StringOfLength<1, 100>;

  @Expose()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  description: StringOfLength<1, 5000>;
}

export class PrivateOrganization {
  @Expose()
  @IsUUID('4')
  readonly public_id: OrganizationId;

  @Expose()
  @MinLength(1)
  @MaxLength(100)
  name: StringOfLength<1, 100>;

  @Expose()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  description: StringOfLength<1, 5000>;

  @Expose()
  @IsUUID('4')
  admin_group_id: ProfileGroupId;

  static create(
    payload: unknown,
    createId = UUIDv4.generate,
  ): Observable<
    e.Either<ParsingError, Omit<PrivateOrganization, 'admin_group_id'>>
  > {
    return parseAndValidateUnknown(payload, CreateOrganizationDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: Omit<PrivateOrganization, 'admin_group_id'> = {
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
    entity: Omit<PrivateOrganization, 'admin_group_id'>,
    adminGroupId: ProfileGroupId,
  ): PrivateOrganization {
    return transformToClass(PrivateOrganization, {
      ...transformToPlain(entity),
      admin_group: adminGroupId,
    });
  }
}
