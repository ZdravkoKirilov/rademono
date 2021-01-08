import { isObject, omit } from "lodash/fp";
import { Nominal } from "simplytyped";

import { enrichEntity } from "../parsers";
import { Tagged } from "../types";
import { GameEntityParser } from "./Base.model";
import { GameId, GameParser } from "./Game.model";
import { ImageAsset, ImageAssetId, toImageId } from "./ImageAsset.model";

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
      owner: GameParser.toPrimaryId(dtoLanguage.owner),
      image: toImageId(dtoLanguage.image),
    } as any
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