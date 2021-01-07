import { Nominal } from 'simplytyped';
import { Observable, of } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { IsOptional, IsString, IsUrl, IsUUID, Max, Min } from 'class-validator';

import {
  Token, Expression, Sonata, Sound,
  Widget, Text, ImageAsset, Sandbox, Shape, Style, Animation, ModuleId, SetupId
} from './';
import { Dictionary, UUIDv4, Url, ParsingError, MalformedPayloadError } from '../types';
import { parseAndValidate, StringOfLength } from '../parsers';

export type GameId = Nominal<UUIDv4, 'GameId'>;

export class Game {

  @IsUUID('4')
  id: GameId;

  @IsString()
  @Min(2)
  @Max(100)
  title: StringOfLength<2, 100>;

  @IsString()
  @Min(2)
  @Max(2000)
  description?: StringOfLength<2, 2000>;

  @IsUrl()
  image?: Url;
}

export class FullGame extends Game { };
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

class CreateGameDto extends BaseGameDto { };

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

type GameOperations = {

  toId: (input: unknown) => o.Option<GameId>

  /* FE before send ( validation ), BE on receive */
  toCreateDto: (input: unknown) => Observable<e.Either<ParsingError | MalformedPayloadError, CreateGameDto>>,
  toDeleteDto: (input: unknown) => Observable<e.Either<ParsingError, DeleteGameDto>>,
  toUpdateDto: (input: unknown) => Observable<e.Either<ParsingError, UpdateGameDto>>,
  toReadDto: (input: unknown) => Observable<e.Either<ParsingError, ReadGameDto>>,

  create: (input: CreateGameDto) => Observable<e.Either<ParsingError, FullGame>>;
  update: (input: UpdateGameDto) => Observable<e.Either<ParsingError, FullGame>>,

  /* FE on receive */
  toEntity: (input: ReadGameDto) => Game,
  toFullEntity: (input: unknown) => Observable<e.Either<ParsingError, FullGame>>;

};

export const GameEntity: GameOperations = {

  toId: (input) => {
    return UUIDv4.parse(input);
  },

  toCreateDto(input) {
    return parseAndValidate(input, CreateGameDto);
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