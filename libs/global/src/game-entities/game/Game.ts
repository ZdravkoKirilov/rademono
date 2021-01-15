import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { classToPlain, Expose, plainToClass } from 'class-transformer';
import { map } from 'rxjs/operators';

import {
  Token,
  Expression,
  Sonata,
  Sound,
  Widget,
  Text,
  ImageAsset,
  Sandbox,
  Shape,
  Style,
  Animation,
  ModuleId,
  SetupId,
} from '../';
import {
  Dictionary,
  UUIDv4,
  Url,
  ParsingError,
  MalformedPayloadError,
  StringOfLength,
  Tagged,
} from '../../types';
import {
  parseAndValidateObject,
  parseAndValidateUnknown,
  ClassType,
} from '../../parsers';

export type GameId = Tagged<'GameId', UUIDv4>;

export class Game {
  id: GameId;
  title: StringOfLength<2, 100>;
  description?: StringOfLength<2, 2000>;
  image?: Url;
}

abstract class ValidatedGameBase {
  @Expose()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: StringOfLength<2, 100>;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  description?: StringOfLength<2, 2000>;

  @Expose()
  @IsOptional()
  @IsUrl()
  image?: Url;
}

export class FullGame extends ValidatedGameBase {
  @Expose({ name: 'id' })
  @IsUUID('4')
  public_id: GameId;
}

export class NewGame extends ValidatedGameBase {}

export class CreateGameDto {
  @Expose()
  @IsString()
  title: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsString()
  image?: string;
}
export class UpdateGameDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsString()
  image?: string;
}

export class ReadGameDto {
  @Expose()
  id: string;
}

type AbstractEntity<
  Id,
  Entity,
  CreateDto,
  UpdateDto,
  ReadDto,
  NewInstance,
  FullInstance
> = {
  toPrimaryId: (input: unknown) => Id;

  /* FE before send, BE on receive */
  toCreateDto: (
    input: unknown,
  ) => Observable<e.Either<ParsingError | MalformedPayloadError, CreateDto>>;
  toUpdateDto: (
    input: unknown,
  ) => Observable<e.Either<ParsingError | MalformedPayloadError, UpdateDto>>;

  /* FE: validation combined with the above DTO; BE - same */
  create: (
    input: CreateDto,
    createId?: () => UUIDv4,
  ) => Observable<e.Either<ParsingError, NewInstance>>;
  update: (
    entity: Entity,
    input: UpdateDto,
  ) => Observable<e.Either<ParsingError, FullInstance>>;

  /* FE on receive */
  toEntity: (input: ReadDto) => Entity;

  // BE before response to FE
  toReadDto: (input: FullInstance) => ReadDto;
  // BE Repo after read from DB
  toFullEntity: (
    input: unknown,
  ) => Observable<e.Either<ParsingError, FullInstance>>;
};

const createAbstractEntity = <Id extends UUIDv4>() => <
  Entity,
  CreateDto,
  UpdateDto,
  ReadDto,
  NewInstance,
  FullInstance
>({
  entityType,
  createDtoType,
  updateDtoType,
  readDtoType,
  newInstanceType,
  fullInstanceType,
}: {
  entityType: ClassType<Entity>;
  createDtoType: ClassType<CreateDto>;
  updateDtoType: ClassType<UpdateDto>;
  readDtoType: ClassType<ReadDto>;
  newInstanceType: ClassType<NewInstance>;
  fullInstanceType: ClassType<FullInstance>;
}): AbstractEntity<
  Id,
  Entity,
  CreateDto,
  UpdateDto,
  ReadDto,
  NewInstance,
  FullInstance
> => ({
  toPrimaryId: (input) => {
    return input as Id;
  },

  toCreateDto(input) {
    return parseAndValidateUnknown(input, createDtoType);
  },

  toUpdateDto(input) {
    return parseAndValidateUnknown(input, updateDtoType);
  },

  toReadDto(input) {
    return plainToClass(readDtoType, classToPlain(input));
  },

  toEntity(input) {
    return plainToClass(entityType, input);
  },

  toFullEntity(input) {
    return parseAndValidateObject(input, fullInstanceType);
  },

  create(input, createId = UUIDv4.generate) {
    return parseAndValidateObject(input, newInstanceType).pipe(
      map((result) => {
        if (e.isRight(result)) {
          return e.right({
            ...result.right,
            public_id: createId(),
          });
        }
        return result;
      }),
    );
  },

  update(entity, input) {
    return parseAndValidateObject(
      { ...entity, ...input },
      fullInstanceType,
    ).pipe(
      map((result) => {
        if (e.isRight(result)) {
          return e.right({ ...entity, ...result.right });
        }
        return result;
      }),
    );
  },
});

export const GameParser = createAbstractEntity<GameId>()({
  entityType: Game,
  createDtoType: CreateGameDto,
  updateDtoType: UpdateGameDto,
  readDtoType: ReadGameDto,
  newInstanceType: NewGame,
  fullInstanceType: FullGame,
});

export type GameTemplate = {
  tokens: Dictionary<Token>;
  expressions: Dictionary<Expression>;
  sonatas: Dictionary<Sonata>;
  sounds: Dictionary<Sound>;
  widgets: Dictionary<Widget>;
  texts: Dictionary<Text>;
  images: Dictionary<ImageAsset>;
  sandboxes: Dictionary<Sandbox>;
  shapes: Dictionary<Shape>;
  styles: Dictionary<Style>;
  animations: Dictionary<Animation>;
};

export type GameData = {
  tokens: Array<Token>;
  expressions: Array<Expression>;
  sonatas: Array<Sonata>;
  sounds: Array<Sound>;
  widgets: Array<Widget>;
  texts: Array<Text>;
  images: Array<ImageAsset>;
  sandboxes: Array<Sandbox>;
  shapes: Array<Shape>;
  styles: Array<Style>;
  animations: Array<Animation>;
};

export type GameState = {
  setup: SetupId;
  module: ModuleId;
};

type LobbyPlayer = {};

export type CreateGamePayload = {
  game_id: number;
  players: LobbyPlayer[];
  lobby_name: string;
  setup: number;
};
