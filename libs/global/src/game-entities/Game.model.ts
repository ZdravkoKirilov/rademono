import { Nominal } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import {
  Module, Token, Expression, Sonata, Sound,
  Widget, Text, ImageAsset, Sandbox, Shape, Style, Animation, ImageAssetId, GameEntityParser, ModuleId, toImageId, toModuleId, SetupId
} from './';
import { enrichEntity } from '../shared';
import { Dictionary, Tagged } from '../types';

export type GameId = Nominal<string, 'GameId'>;
export const toGameId = (source: unknown) => String(source) as GameId;

export type Game = Tagged<'Game', {
  id: GameId;

  title: string;
  description: string;
  image: string;

  languages: GameLanguage[];
  menu: ModuleId;
}>;

export type DtoGame = Omit<Game, '__tag' | 'id' | 'languages' | 'menu'> & {
  id: number;
  menu: number;
  languages: DtoGameLanguage[];
};

export const Game: GameEntityParser<Game, DtoGame, RuntimeGame> & GameOperations = {

  saveLanguage(game, language) {
    return {
      ...game,
      languages: game.languages.map(elem => elem.id === language.id ? language : elem),
    };
  },

  removeLanguage(game, language) {
    return {
      ...game,
      languages: game.languages.filter(elem => elem.id !== language.id)
    };
  },

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Game',
        ...input
      } as Game;
    },

  },

  toRuntime(context, game) {
    return enrichEntity<Game, RuntimeGame>(context.conf, {
      menu: 'modules',
    }, game);
  },

  toDto(game) {
    return {
      ...omit('__tag', game),
      id: Number(game.id),
      menu: Number(game.menu),
      languages: game.languages.map(elem => GameLanguage.toDto(elem)),
    }
  },

  toEntity(gameDto) {
    return {
      ...gameDto,
      __tag: 'Game',
      id: toGameId(gameDto.id),
      menu: toModuleId(gameDto.menu),
      languages: gameDto.languages.map(elem => GameLanguage.toEntity(elem))
    }
  }

}

type GameOperations = {
  saveLanguage: (game: Game, language: GameLanguage) => Game;
  removeLanguage: (game: Game, language: GameLanguage) => Game;
}

export type RuntimeGame = Omit<Game, 'menu'> & {
  menu: Module;
};

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