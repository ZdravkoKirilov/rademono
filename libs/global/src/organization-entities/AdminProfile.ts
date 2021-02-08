import { Expose } from 'class-transformer';
import { IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import { parseAndValidateObject, transformToClass } from '../parsers';
import { AdminUserId } from '../user-entities';
import { ProfileGroupId } from './ProfileGroup';

type AdminProfileId = Tagged<'AdminProfileId', UUIDv4>;

export class AdminProfile {
  id: AdminProfileId;
  user: AdminUserId;
  group: ProfileGroupId;
}

export class PrivateAdminProfile {
  @Expose()
  @IsUUID('4')
  public_id: AdminProfileId;

  @Expose()
  @IsUUID('4')
  user: AdminUserId;

  @Expose()
  @IsUUID('4')
  group: ProfileGroupId;

  @Expose()
  @MinLength(1)
  @MaxLength(100)
  name: StringOfLength<1, 100>;
}

class CreateUserGroupDto {
  @Expose()
  @MinLength(1)
  @MaxLength(100)
  name: StringOfLength<1, 100>;

  @Expose()
  @IsUUID('4')
  user: AdminUserId;

  @Expose()
  @IsUUID('4')
  group: ProfileGroupId;
}

export const AdminProfileParser = {
  create(
    payload: unknown,
    createId = UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateAdminProfile>> {
    return parseAndValidateObject(payload, CreateUserGroupDto).pipe(
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
  },
};
