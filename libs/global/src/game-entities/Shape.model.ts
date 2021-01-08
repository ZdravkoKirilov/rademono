import { Nominal, Omit } from "simplytyped";
import { isObject, omit } from "lodash/fp";

import { ParamedExpressionFunc } from "./Expression.model";
import { Style } from "./Style.model";
import { WithStyle, BaseModel, GameEntityParser } from "./Base.model";
import { toModuleId } from "./Module.model";
import { Tagged } from "../types";
import { enrichEntity, parseAndBind, safeJSON } from "../parsers";

export type ShapeId = Nominal<string, 'ShapeId'>;
export const toShapeId = (source: unknown) => String(source) as ShapeId;

export type Shape = Tagged<'Shape', WithStyle & BaseModel<ShapeId> & {
  type: ShapeType;
  points: ShapePoint[];
}>;

export type DtoShape = Omit<Shape, '__tag' | 'id' | 'module' | 'type' | 'points'> & {
  id: number;
  module: number;
  type: string;
  points: DtoShapePoint[];
}

export type RuntimeShape = Omit<Shape, 'style' | 'style_inline'> & {
  style: ParamedExpressionFunc<RuntimeShape, Style>;
  style_inline: Style;
};

export const Shape: GameEntityParser<Shape, DtoShape, RuntimeShape> & ShapeOperations = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Shape',
        ...input
      } as Shape;
    },

  },

  toRuntime(context, shape) {
    return enrichEntity<Shape, RuntimeShape>(context.conf, {
      style: src => parseAndBind(context)(src),
      style_inline: src => safeJSON(src, {}),
    }, shape);
  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Shape',
      id: toShapeId(dto.id),
      module: toModuleId(dto.module),
      type: dto.type as ShapeType,
      points: dto.points.map(elem => ShapePoint.toEntity(elem))
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      module: Number(entity.module),
      points: entity.points.map(elem => ShapePoint.toDto(elem))
    };
  },

  savePoint(shape, point) {
    return {
      ...shape,
      points: shape.points.map(elem => elem.id === point.id ? point : elem)
    };
  },

  removePoint(shape, point) {
    return {
      ...shape,
      points: shape.points.filter(elem => elem.id !== point.id)
    };
  },
}

type ShapeOperations = {
  savePoint: (shape: Shape, point: ShapePoint) => Shape;
  removePoint: (shape: Shape, point: ShapePoint) => Shape;
}

export type ShapePointId = Nominal<string, 'ShapePointId'>;
const toShapePointId = (source: unknown) => String(source) as ShapePointId;

export type ShapePoint = Tagged<'ShapePoint', {
  id: ShapePointId;
  owner: ShapeId;

  x: string;
  y: string;
}>;

export type DtoShapePoint = Omit<ShapePoint, '__tag' | 'id' | 'owner'> & {
  id: number;
  owner: number;
};

export const ShapePoint: GameEntityParser<ShapePoint, DtoShapePoint, ShapePoint> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'ShapePoint',
        ...input
      } as ShapePoint;
    },

  },

  toRuntime(_, entity) {
    return entity;
  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'ShapePoint',
      id: toShapePointId(dto.id),
      owner: toShapeId(dto.owner),
    }
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      owner: Number(entity.owner),
    };
  }
};

export const SHAPE_TYPES = {
  rectange: 'rectangle',
  circle: 'circle',
  polygon: 'polygon',
  ellipse: 'ellipse',
  line: 'line',
} as const;

export type ShapeType = keyof typeof SHAPE_TYPES;