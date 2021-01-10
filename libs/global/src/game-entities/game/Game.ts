import { Nominal } from 'simplytyped';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import { IsOptional, IsString, IsUrl, IsUUID, Max, Min } from 'class-validator';
import { classToPlain, Expose, plainToClass } from 'class-transformer';

import {
  Token, Expression, Sonata, Sound,
  Widget, Text, ImageAsset, Sandbox, Shape, Style, Animation, ModuleId, SetupId
} from '../';
import { Dictionary, UUIDv4, Url, ParsingError, MalformedPayloadError } from '../../types';
import { parseAndValidateObject, parseAndValidateUnknown, StringOfLength, ClassType } from '../../parsers';

export type GameId = Nominal<UUIDv4, 'GameId'>;

export class Game {

  id: GameId;
  title: StringOfLength<2, 100>;
  description?: StringOfLength<2, 2000>;
  image?: Url;
}

abstract class ValidatedGameBase {

  @Expose()
  @IsString()
  @Min(2)
  @Max(100)
  title: StringOfLength<2, 100>;

  @Expose()
  @IsString()
  @Min(2)
  @Max(2000)
  description?: StringOfLength<2, 2000>;

  @Expose()
  @IsUrl()
  image?: Url;

}

export class FullGame extends ValidatedGameBase {

  @Expose({ name: 'id' })
  @IsUUID('4')
  public_id: GameId;
}

export class NewGame extends ValidatedGameBase { }

abstract class BaseGameDto {
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

export class CreateGameDto extends BaseGameDto { };
export class UpdateGameDto extends BaseGameDto {
  @Expose()
  @IsString()
  id: string;
}

export class ReadGameDto extends BaseGameDto {
  @Expose()
  id: string;
};

type AbstractEntity<Id, Entity, CreateDto, UpdateDto, ReadDto, NewInstance, FullInstance> = {
  toPrimaryId: (input: unknown) => Id

  /* FE before send, BE on receive */
  toCreateDto: (input: unknown) => Observable<e.Either<ParsingError | MalformedPayloadError, CreateDto>>,
  toUpdateDto: (input: unknown) => Observable<e.Either<ParsingError | MalformedPayloadError, UpdateDto>>,

  /* FE: validation combined with the above DTO; BE - same */
  create: (input: CreateDto) => Observable<e.Either<ParsingError, NewInstance>>;
  update: (input: UpdateDto) => Observable<e.Either<ParsingError, FullInstance>>,

  /* FE on receive */
  toEntity: (input: ReadDto) => Entity,

  // BE before response to FE
  toReadDto: (input: FullInstance) => ReadDto,
  // BE Repo after read from DB
  toFullEntity: (input: unknown) => Observable<e.Either<ParsingError, FullInstance>>;
}

const createAbstractEntity = <Id extends UUIDv4>() => <Entity, CreateDto, UpdateDto, ReadDto, NewInstance, FullInstance>(
  {
    entityType, createDtoType, updateDtoType, readDtoType, newInstanceType, fullInstanceType
  }: {
    entityType: ClassType<Entity>,
    createDtoType: ClassType<CreateDto>,
    updateDtoType: ClassType<UpdateDto>,
    readDtoType: ClassType<ReadDto>,
    newInstanceType: ClassType<NewInstance>,
    fullInstanceType: ClassType<FullInstance>,
  }
): AbstractEntity<Id, Entity, CreateDto, UpdateDto, ReadDto, NewInstance, FullInstance> => ({

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

  create(input) {
    return parseAndValidateObject(input, newInstanceType);
  },

  update(input) {
    return parseAndValidateObject(input, fullInstanceType);
  }
});

export const GameParser = createAbstractEntity<GameId>()({
  entityType: Game,
  createDtoType: CreateGameDto,
  updateDtoType: UpdateGameDto,
  readDtoType: ReadGameDto,
  newInstanceType: NewGame,
  fullInstanceType: FullGame
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