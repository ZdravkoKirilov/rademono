import { Nominal } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import { Module, ModuleId, toModuleId } from "./Module.model";
import { GameEntityParser } from './Base.model';
import { GameId, toGameId } from './Game.model';
import { Tagged } from '../types';
import { enrichEntity } from '../shared';

export type VersionId = Nominal<string, 'VersionId'>;
export const toVersionId = (source: unknown) => String(source) as VersionId;

export type Version = Tagged<'Version', {
  id: VersionId;
  game: GameId;

  name: string;
  description: string;

  date_created: string;
  date_modified: string;

  menu: ModuleId;
}>;

export type DtoVersion = Omit<Version, '__tag' | 'id' | 'game' | 'menu'> & {
  id: number;
  game: number;
  menu: number;
};

export type RuntimeVersion = Omit<Version, 'menu'> & {
  menu: Module;
};

export const Version: GameEntityParser<Version, DtoVersion, RuntimeVersion> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Version',
        ...input
      } as Version;
    },

  },

  toRuntime(context, version) {
    const config = context.conf;
    return enrichEntity<Version, RuntimeVersion>(config, {
      menu: 'modules'
    }, version);
  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Version',
      id: toVersionId(dto.id),
      game: toGameId(dto.game),
      menu: toModuleId(dto.menu),
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      game: Number(entity.game),
      menu: Number(entity.menu),
    };
  },
  
};

