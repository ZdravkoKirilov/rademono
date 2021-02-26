/* GameGroups can be school subjects, or more granular. They are just a grouping
mechanism + might have different permissions/editors */
import { Expose } from 'class-transformer';
import { IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import {
  parseAndValidateObject,
  parseAndValidateUnknown,
  transformToClass,
} from '../parsers';
import { OrganizationId } from './Organization';
import { GameId } from '../game-entities';
import { ProfileGroupId } from './ProfileGroup';

export type GameGroupId = Tagged<'GameGroupId', UUIDv4>;

class BaseFields {
  @Expose()
  @IsUUID('4')
  organization: OrganizationId;

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
  @IsUUID('4', { each: true })
  games: Set<GameId>;

  @Expose()
  @IsUUID('4')
  admin_group: ProfileGroupId;
}

export class GameGroup extends BaseFields {
  @Expose()
  @IsUUID('4')
  id: GameGroupId;
}

export class PrivateGameGroup extends BaseFields {
  @Expose()
  @IsUUID('4')
  public_id: GameGroupId;

  static create(
    payload: unknown,
    createId: typeof UUIDv4.generate,
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
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateGameGroup);
  }

  static toPublicEntity(source: PrivateGameGroup): GameGroup {
    return {
      id: source.public_id,
      organization: source.organization,
      name: source.name,
      description: source.description,
      games: source.games,
      admin_group: source.admin_group,
    };
  }
}

class CreateGameGroupDto extends BaseFields {}
