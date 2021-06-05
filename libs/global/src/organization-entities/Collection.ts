/* Collections are campuses, departments, school classes and so on.
   1. It either uses the organization's admin_group or its own override
   2. Could serve as a game grouping mechanism. Each game has a separate
      admin_group though. So it's like a school subject
   3. Could serve as a grouping mechanism for other collections. 
   4. Could serve as profile grouping for games. Which means games and saved
      game data are collection-aware and operate in the context of a collection.
      This helps LMS systems where collections can be school classes
   5. Collections can use other collections as template 
 */
import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import { map } from 'rxjs/operators';

import { parseAndValidateUnknown, transformToClass } from '../parsers';
import { ParsingError, StringOfLength, Tagged, UUIDv4 } from '../types';
import { GameId } from '../game-entities';
import { OrganizationId } from './Organization';
import { AdminGroup, PrivateAdminGroup } from './AdminGroup';
import { PrivateProfileGroup, ProfileGroup } from './ProfileGroup';

export type CollectionId = Tagged<'CollectionId', UUIDv4>;

class BasicFields {
  @Expose()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
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
  organization: OrganizationId;

  @Expose()
  @IsOptional()
  @IsUUID('4', { each: true })
  games?: GameId[];

  @Expose()
  @IsOptional()
  @IsUUID('4', { each: true })
  children?: CollectionId[];
}

class CreateCollectionDto extends BasicFields {}

export class Collection extends ValidationBase {
  @Expose()
  @IsUUID('4')
  id: CollectionId;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminGroup)
  admin_group?: AdminGroup;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileGroup)
  profile_group?: ProfileGroup;
}

export class PrivateCollection extends ValidationBase {
  @Expose()
  @IsUUID('4')
  public_id: CollectionId;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => PrivateAdminGroup)
  admin_group?: PrivateAdminGroup;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => PrivateProfileGroup)
  profile_group?: PrivateProfileGroup;

  static updateAdminGroup<T extends PrivateCollection>(
    entity: T,
    group: PrivateAdminGroup,
  ): T & { admin_group: PrivateAdminGroup } {
    return {
      ...entity,
      admin_group: group,
    };
  }

  static updateProfileGroup<T extends PrivateCollection>(
    entity: T,
    group: PrivateProfileGroup,
  ): T & { profile_group: PrivateProfileGroup } {
    return {
      ...entity,
      profile_group: group,
    };
  }

  static updateGames<T extends PrivateCollection>(
    entity: T,
    games: GameId[],
  ): T & { games: GameId[] } {
    return {
      ...entity,
      games,
    };
  }

  static updateChildren<T extends PrivateCollection>(
    entity: T,
    children: CollectionId[],
  ): T & {
    children: CollectionId[];
  } {
    return {
      ...entity,
      children,
    };
  }

  static create(
    payload: unknown,
    createId: () => CollectionId,
    organization: OrganizationId,
  ): Observable<e.Either<ParsingError, PrivateCollection>> {
    return parseAndValidateUnknown(payload, CreateCollectionDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: PrivateCollection = {
            ...result.right,
            organization,
            public_id: createId(),
          };

          return e.right(transformToClass(PrivateCollection, plain));
        }
        return result;
      }),
    );
  }

  static createFromDto(
    dto: { name: string; description?: string },
    collectionId = UUIDv4.generate<CollectionId>(),
    organization = UUIDv4.generate<OrganizationId>(),
  ) {
    return transformToClass(PrivateCollection, {
      ...dto,
      public_id: collectionId,
      organization,
    });
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateCollection);
  }

  static toPublicEntity(source: PrivateCollection): Collection {
    return {
      id: source.public_id,
      name: source.name,
      admin_group: source.admin_group
        ? PrivateAdminGroup.toPublicEntity(source.admin_group)
        : undefined,
      description: source.description,
      organization: source.organization,
    };
  }
}
