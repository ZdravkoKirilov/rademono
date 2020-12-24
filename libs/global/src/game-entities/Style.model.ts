import { Nominal, Omit } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import { BaseModel, GameEntityParser } from "./Base.model";
import { toModuleId } from './Module.model';
import { Tagged } from '../types';

export type StyleId = Nominal<string, 'StyleId'>;
export const toStyleId = (source: unknown) => String(source) as StyleId;

export type Style = BaseModel<StyleId> & CoreStyles & Tagged<'Style'>;

export type DtoStyle = Omit<Style, 'id' | 'module' | '__tag'> & {
  id: number;
  module: number;
};

export const Style: GameEntityParser<Style, DtoStyle, Style> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Style',
        ...input
      } as Style;
    },

  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Style',
      id: toStyleId(dto.id),
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

export type CoreStyles = {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;

  rotation: number;  // degrees
  skew: string; // "xValue yValue"
  pivot: string;  // "xValue yValue"
  anchor: string; // "xValue yValue"
  scale: string; // "xValue yValue"

  opacity: number;
  fill: number | string | string[];
  tint: number | string;
  radius: number;
  border_radius: number;

  stroke_thickness: number;
  stroke_color: string | number;

  mask: number[];

  font_size: number;
  font_family: string;
  font_style: FontStyle;
};

type FontStyle = 'bold' | 'italic' | 'normal';