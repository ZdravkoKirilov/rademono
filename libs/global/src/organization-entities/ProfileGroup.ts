import { Expose } from 'class-transformer';
import { IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import { parseAndValidateObject, transformToClass } from '../parsers';

export type ProfileGroupId = Tagged<'ProfileGroupId', UUIDv4>;

export class ProfileGroup {
  id: ProfileGroupId;
  name: StringOfLength<1, 100>;
  description: StringOfLength<1, 5000>;
}

export class PrivateProfileGroup {
  @Expose()
  @IsUUID('4')
  public_id: ProfileGroupId;

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

class CreateProfileGroupDto {
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

export const ProfileGroupParser = {
  create(
    payload: unknown,
    createId = UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateProfileGroup>> {
    return parseAndValidateObject(payload, CreateProfileGroupDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: PrivateProfileGroup = {
            ...result.right,
            public_id: createId(),
          };

          return e.right(transformToClass(PrivateProfileGroup, plain));
        }
        return result;
      }),
    );
  },
};
