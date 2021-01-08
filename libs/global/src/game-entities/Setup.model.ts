import { Nominal, Omit } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import { ExpressionFunc } from "./Expression.model";
import { ModuleId } from './Module.model';
import { toVersionId, VersionId } from './Version.model';
import { ImageAssetId, toImageId } from './ImageAsset.model';
import { GameEntityParser } from './Base.model';
import { Tagged } from '../types';
import { enrichEntity, parseAndBind } from '../parsers';
import { GameLanguageId } from './GameLanguage';

export type SetupId = Nominal<string, 'SetupId'>;
export const toSetupId = (source: unknown) => String(source) as SetupId;

export type Setup = Tagged<'Setup', {
  id: SetupId;
  version: VersionId;

  image: ImageAssetId;
  name: string;
  description: string;

  min_players: number;
  max_players: number;
  recommended_age: number;

  get_active_module: string;
  get_active_language: string;
}>;

export type DtoSetup = Omit<Setup, '__tag' | 'id' | 'version' | 'image'> & {
  id: number;
  version: number;
  image: number;
};

export type RuntimeSetup = Omit<Setup, 'get_active_language' | 'get_active_module'> & {
  get_active_module: ExpressionFunc<ModuleId>;
  get_active_language: ExpressionFunc<GameLanguageId>;
};

export const Setup: GameEntityParser<Setup, DtoSetup, RuntimeSetup> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Setup',
        ...input
      } as Setup;
    },

  },

  toRuntime(context, setup) {

    return enrichEntity<Setup, RuntimeSetup>(context.conf, {
      get_active_language: src => parseAndBind(context)(src),
      get_active_module: src => parseAndBind(context)(src),
    }, setup);

  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      version: Number(entity.version),
      image: Number(entity.image),
    }
  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Setup',
      id: toSetupId(dto.id),
      version: toVersionId(dto.version),
      image: toImageId(dto.image),
    };
  }
};

