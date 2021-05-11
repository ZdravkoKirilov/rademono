import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import { parseAndValidateUnknown, transformToClass } from '../parsers';
import { PrivateAdminProfile } from './AdminProfile';

export type AdminGroupId = Tagged<'AdminGroupId', UUIDv4>;

class ValidationBase {
  @Expose()
  @IsUUID('4')
  organization: AdminGroupId;

  @Expose()
  @MinLength(1)
  @MaxLength(100)
  name: StringOfLength<1, 100>;

  @Expose()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  description?: StringOfLength<1, 5000>;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrivateAdminProfile)
  profiles: PrivateAdminProfile[];
}

export class AdminGroup extends ValidationBase {
  @Expose()
  id: AdminGroupId;
}

export class PrivateAdminGroup extends ValidationBase {
  @Expose()
  @IsUUID('4')
  public_id: AdminGroupId;

  static create(
    payload: unknown,
    createId: typeof UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateAdminGroup>> {
    return parseAndValidateUnknown(payload, CreateAdminGroupDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: PrivateAdminGroup = {
            ...result.right,
            public_id: createId(),
          };

          return e.right(transformToClass(PrivateAdminGroup, plain));
        }
        return result;
      }),
    );
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateAdminGroup);
  }

  static toPublicEntity(data: PrivateAdminGroup): AdminGroup {
    return {
      id: data.public_id,
      name: data.name,
      description: data.description,
      organization: data.organization,
      profiles: data.profiles,
    };
  }
}

export class CreateAdminGroupDto extends ValidationBase {}
