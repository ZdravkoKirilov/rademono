import { Expose } from 'class-transformer';
import { IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import {
  parseAndValidateObject,
  parseAndValidateUnknown,
  transformToClass,
} from '../parsers';
import { AdminUserId } from '../user-entities';
import { ProfileGroupId } from './ProfileGroup';

type AdminProfileId = Tagged<'AdminProfileId', UUIDv4>;

export class AdminProfile {
  @Expose()
  id: AdminProfileId;

  @Expose()
  user: AdminUserId;

  @Expose()
  group: ProfileGroupId;

  @Expose()
  name: StringOfLength<1, 100>;
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

  static createFromUnknown(
    payload: unknown,
    createId = UUIDv4.generate,
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
    payload: CreateAdminProfileDto,
    createId = UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateAdminProfile>> {
    return parseAndValidateObject(payload, CreateAdminProfileDto).pipe(
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
}

class CreateAdminProfileDto {
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
