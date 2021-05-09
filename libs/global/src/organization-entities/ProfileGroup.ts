/* both AdminProfile and CustomerProfile could point to it , therefore they
are not embedded */

import { Expose } from 'class-transformer';
import { IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import { parseAndValidateUnknown, transformToClass } from '../parsers';

export type ProfileGroupId = Tagged<'ProfileGroupId', UUIDv4>;

class ValidationBase {
  @Expose()
  @IsUUID('4')
  organization: ProfileGroupId;

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

export class ProfileGroup extends ValidationBase {
  @Expose()
  id: ProfileGroupId;
}

export class PrivateProfileGroup extends ValidationBase {
  @Expose()
  @IsUUID('4')
  public_id: ProfileGroupId;

  static create(
    payload: unknown,
    createId: typeof UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateProfileGroup>> {
    return parseAndValidateUnknown(payload, CreateProfileGroupDto).pipe(
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
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateProfileGroup);
  }

  static toPublicEntity(data: PrivateProfileGroup): ProfileGroup {
    return {
      id: data.public_id,
      name: data.name,
      description: data.description,
      organization: data.organization,
    };
  }
}

export class CreateProfileGroupDto extends ValidationBase {}
