import { Expose } from 'class-transformer';
import { IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import { parseAndValidateUnknown, transformToClass } from '../parsers';
import { UserId } from '../user-entities';
import { ProfileGroupId } from './ProfileGroup';

export type AdminProfileId = Tagged<'AdminProfileId', UUIDv4>;

class ValidationBase {
  @Expose()
  @MinLength(1)
  @MaxLength(100)
  name: StringOfLength<1, 100>;

  @Expose()
  @IsUUID('4')
  user: UserId;

  @Expose()
  @IsUUID('4')
  group: ProfileGroupId;
}

export class AdminProfile extends ValidationBase {
  @Expose()
  @IsUUID('4')
  id: AdminProfileId;
}

export class PrivateAdminProfile extends ValidationBase {
  @Expose()
  @IsUUID('4')
  public_id: AdminProfileId;

  static create(
    payload: unknown,
    createId: () => AdminProfileId,
  ): Observable<e.Either<ParsingError, PrivateAdminProfile>> {
    return parseAndValidateUnknown(payload, CreateAdminProfileDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: PrivateAdminProfile = {
            ...result.right,
            public_id: createId(),
          };

          return e.right(transformToClass(PrivateAdminProfile, plain));
        }
        return result;
      }),
    );
  }

  static createFromDto(
    payload: ValidationBase,
    createId: () => AdminProfileId,
  ) {
    const data = {
      ...payload,
      public_id: createId(),
    };
    return transformToClass(PrivateAdminProfile, data);
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateAdminProfile);
  }

  static toPublicEntity(source: PrivateAdminProfile): AdminProfile {
    return {
      id: source.public_id,
      name: source.name,
      user: source.user,
      group: source.group,
    };
  }
}

export class CreateAdminProfileDto extends ValidationBase {}
