import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Expose } from 'class-transformer';

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
  createAbstractEntity,
} from '../';
import { Dictionary, UUIDv4, Url, StringOfLength, Tagged } from '../../types';

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
