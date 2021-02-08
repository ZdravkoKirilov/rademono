import { Expose } from 'class-transformer';
import { IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import { parseAndValidateObject, transformToClass } from '../parsers';

export type GameGroupId = Tagged<'GameGroupId', UUIDv4>;

export class GameGroup {
  id: GameGroupId;
  name: StringOfLength<1, 100>;
  description: StringOfLength<1, 5000>;
}

export class PrivateGameGroup {
  @Expose()
  @IsUUID('4')
  public_id: GameGroupId;

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

class CreateGameGroupDto {
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

export const GameGroupParser = {
  create(
    payload: unknown,
    createId = UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateGameGroup>> {
    return parseAndValidateObject(payload, CreateGameGroupDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: PrivateGameGroup = {
            ...result.right,
            public_id: createId(),
          };

          return e.right(transformToClass(PrivateGameGroup, plain));
        }
        return result;
      }),
    );
  },
};
