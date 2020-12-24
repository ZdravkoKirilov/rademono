import { Nominal, Omit } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import { BaseModel, GameEntityParser } from "./Base.model";
import { toModuleId } from './Module.model';
import { Tagged } from '../types';

export type SoundId = Nominal<string, 'SoundId'>;
export const toSoundId = (source: unknown) => String(source) as SoundId;

export type Sound = BaseModel<SoundId> & Tagged<'Sound', {
  file: string; // TODO: "File" type
}>;

export type DtoSound = Omit<Sound, '__tag' | 'id' | 'module'> & {
  id: number;
  module: number;
};

export const Sound: GameEntityParser<Sound, DtoSound, Sound> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Sound',
        ...input
      } as Sound;
    },

  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Sound',
      id: toSoundId(dto.id),
      module: toModuleId(dto.module),
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      module: Number(entity.module),
    };
  },

  toRuntime(_, entity) {
    return entity;
  }
};