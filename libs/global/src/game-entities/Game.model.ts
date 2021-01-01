import { Nominal } from 'simplytyped';
import { isObject, isString, omit } from 'lodash/fp';
import { Observable } from 'rxjs';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import {
  Token, Expression, Sonata, Sound,
  Widget, Text, ImageAsset, Sandbox, Shape, Style, Animation, ImageAssetId, GameEntityParser, ModuleId, toImageId, SetupId
} from './';
import { enrichEntity } from '../shared';
import { Dictionary, Tagged, toTagged, UUIDv4, Url, ParsingError, CannotBeEmpty, MustBeAstring, InvalidPayload } from '../types';


const NotAValidGameId = 'NotAValidGameId';
type InvalidGameId = Tagged<typeof NotAValidGameId>;
export type GameId = Nominal<UUIDv4, 'GameId'>;

export const toGameId = (source: unknown): GameId | InvalidGameId => {
  const result = UUIDv4.parse(source);
  return isString(result) ? result as GameId : toTagged('NotAValidGameId');
};

type tag = 'Game';

export type Game = Tagged<tag, {
  id: GameId;

  title: string;
  description?: string;
  image?: Url;

}>;

@Entity()
export class GameDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  public_id: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  description?: string;

  @Column('text')
  image?: string;

}

export type TaggedGameDto = Tagged<tag, CreateGameDto | UpdateGameDto | DeleteGameDto>;

type CreateGameDto = {
  title: string;
  description: string;
  image: string;
};

type UpdateGameDto = {
  id: string;
  title: string;
  description: string;
  image: string;
};

type DeleteGameDto = {
  id: string;
};

type ReadGameDto = {
  id: string;
};

type FullGameDto = Omit<GameDBModel, 'public_id'>;

type CreateGameDtoParsingError = ParsingError<InvalidPayload, Partial<{
  title: CannotBeEmpty | MustBeAstring,
  description: MustBeAstring,
  image: MustBeAstring,
}>>;

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

type GameOperations = {

  /* FE before send ( validation ), BE on receive */
  toCreateDto: (input: unknown) => Observable<CreateGameDto | CreateGameDtoParsingError>,
  toDeleteDto: (input: unknown) => Observable<DeleteGameDto | DeleteGameDtoParsingError>,
  toEditDto: (input: unknown) => Observable<UpdateGameDto | UpdateGameDtoParsingError>,
  toReadDto: (input: unknown) => Observable<ReadGameDto | ReadGameDtoParsingError>,

  create: (input: CreateGameDto) => CreateGameDto & { public_id: UUIDv4 },
  update: (input: UpdateGameDto) => Partial<FullGameDto>,

  /* BE before response, 'public_id' becomes 'id' here. DB corruption validation
  could possibly happen here */
  toFullDto: (input: GameDBModel) => FullGameDto,

  /* FE on receive */
  toEntity: (input: FullGameDto) => Game,

};

export const GameEntity: GameOperations = {

}

const GameLanguage: GameEntityParser<GameLanguage, DtoGameLanguage, RuntimeGameLanguage> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'GameLanguage',
        ...input
      } as GameLanguage;
    },

  },

  toDto(language) {
    return {
      ...omit('__tag', language),
      id: Number(language.id),
      owner: Number(language.owner),
      image: Number(language.image),
    };
  },
  toEntity(dtoLanguage) {
    return {
      ...dtoLanguage,
      __tag: 'GameLanguage',
      id: toGameLanguageId(dtoLanguage.id),
      owner: toGameId(dtoLanguage.owner),
      image: toImageId(dtoLanguage.image),
    }
  },

  toRuntime(context, language) {
    return enrichEntity<GameLanguage, RuntimeGameLanguage>(context.conf, {
      image: 'images',
    }, language);
  }
};

export type GameLanguageId = Nominal<string, 'GameLanguageId'>;
export const toGameLanguageId = (source: unknown) => String(source) as GameLanguageId;

export type GameLanguage = Tagged<'GameLanguage', {
  id: GameLanguageId;
  owner: GameId;
  name: string;
  display_name?: string;
  image?: ImageAssetId;
}>;

export type RuntimeGameLanguage = Omit<GameLanguage, 'image'> & {
  image?: ImageAsset;
};

export type DtoGameLanguage = Omit<GameLanguage, '__tag' | 'id' | 'owner' | 'image'> & {
  id: number;
  owner: number;
  image: number;
};

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