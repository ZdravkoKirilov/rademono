import { Nominal } from 'simplytyped';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { IsOptional, IsString, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import {
  Token, Expression, Sonata, Sound,
  Widget, Text, ImageAsset, Sandbox, Shape, Style, Animation, ImageAssetId, GameEntityParser, ModuleId, toImageId, SetupId
} from './';

import { Dictionary, Tagged, UUIDv4, Url, ParsingError, InvalidPayload, PayloadIsNotAnObject, toParsingError } from '../types';
import { enrichEntity, CannotBeEmpty, MustBeAstring, nonEmptyObject, parseObject, optionalString, nonEmptyString, StringOfLength } from '../parsers';
import { isObject } from 'lodash';

/*
  toCreateDto, toUpdateDto, toDeleteDto - FE edit, BE input, ( with validation )
  toReadDto - BE response ( no validation ) DTO version of public entity

  toPublicEntity - FE on receive ( no validation ), FE on form change ( with validation ),
    entity with limited fields
    
  toRichEntity - FE, populated entity

  create - BE, full entity ( has id, which the repository will use as public_id) (has validation)
  update - BE, full entity ( has validation )
  toEntity - BE during repo read, full fields entity ( has validation )

*/

export type GameId = Nominal<UUIDv4, 'GameId'>;

type tag = 'Game';

export type Game = Tagged<tag, {
  id: GameId;

  title: StringOfLength<2, 100>;
  description?: StringOfLength<2, 2000>;
  image?: Url;

}>;

export type TaggedGameDto = Tagged<tag, CreateGameDto | UpdateGameDto | DeleteGameDto>;

class BaseGameDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;
}

class UpdateGameDto extends BaseGameDto {
  @IsString()
  id: string;
}

class DeleteGameDto {
  @IsString()
  id: string;
}

class ReadGameDto extends BaseGameDto {
  @IsString()
  id: string;
};

type InvalidCreateGameDtoFields = {
  title: CannotBeEmpty | MustBeAstring,
  description: MustBeAstring,
  image: MustBeAstring,
};

type CreateGameDtoParsingError = ParsingError<InvalidPayload, Partial<InvalidCreateGameDtoFields>>;

type DeleteGameDtoParsingError = ParsingError<InvalidPayload, Partial<{
  id: CannotBeEmpty | MustBeAstring,
}>>;

type ReadGameDtoParsingError = ParsingError<InvalidPayload, Partial<{
  id: CannotBeEmpty | MustBeAstring,
}>>;

type UpdateGameDtoParsingError = ParsingError<InvalidPayload, Partial<{
  id: CannotBeEmpty | MustBeAstring,
  title: CannotBeEmpty | MustBeAstring,
  description: MustBeAstring,
  image: MustBeAstring,
}>>;

type UpdateEntityParsingError = ParsingError<InvalidPayload, Partial<{
  id: typeof UUIDv4.NotAValidUUID,
  image: typeof Url.NotAValidUrl,
}>>;

type CreateEntityParsingError = ParsingError<InvalidPayload, Partial<{
  image: typeof Url.NotAValidUrl,
}>>;

type GameOperations = {

  toPrimaryId: (input: unknown) => o.Option<GameId>,

  /* FE before send ( validation ), BE on receive */
  toCreateDto: (input: unknown) => Observable<e.Either<CreateGameDtoParsingError, CreateGameDto>>,
  toDeleteDto: (input: unknown) => Observable<e.Either<DeleteGameDtoParsingError, DeleteGameDto>>,
  toUpdateDto: (input: unknown) => Observable<e.Either<UpdateGameDtoParsingError, UpdateGameDto>>,
  toReadDto: (input: unknown) => Observable<e.Either<ReadGameDtoParsingError, ReadGameDto>>,

  create: (input: CreateGameDto) =>
    e.Either<
      CreateEntityParsingError,
      Omit<GameDBModel, 'id' | 'public_id'> & { public_id: UUIDv4 }
    >,
  update: (input: UpdateGameDto) => e.Either<UpdateEntityParsingError, Omit<GameDBModel, 'id' | 'public_id'>>,

  /* BE before response, 'public_id' becomes 'id' here. DB corruption validation
  could possibly happen here */
  toFullDto: (input: GameDBModel) => FullGameDto,

  /* FE on receive */
  toEntity: (input: FullGameDto) => Game,

};

export const GameEntity: GameOperations = {

  toPrimaryId: (input) => {
    return UUIDv4.parse(input) as o.Option<GameId>;
  },

  toCreateDto(input) {
    if (!isObject(input)) {
      return e.left(PayloadIsNotAnObject);
    }
    const dto = plainToClass(BaseGameDto, input);
    return from(validate(dto, { whitelist: true })).pipe(
      map(errors => {

      })
    )
  }
}

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