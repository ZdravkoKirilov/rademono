import { ExpressionContext } from "../types";
import { ParamedExpressionFunc } from "./Expression.model";
import { ModuleId } from './Module.model';
import { CoreStyles } from "./Style.model";
import { ModularEntity } from './types';

export type BaseModel<T = ModularEntity['id']> = {
  id: T;

  name: string;
  description: string;
  module: ModuleId;
};

export type WithStyle = {
  style: string; // Expression -> Style
  style_inline: CoreStyles;
};

export type WithRuntimeStyle<T = any> = {
  style_inline: CoreStyles;
  style: ParamedExpressionFunc<T, CoreStyles>;
};

export type GameEntityParser<Entity, DtoEntity, RuntimeEntity> = {
  toRuntime: (context: ExpressionContext, entity: Entity, ...args: any[]) => RuntimeEntity;
  toDto: (entity: Entity) => DtoEntity;
  toEntity: (dtoEntity: DtoEntity) => Entity;

  fromUnknown: {
    toEntity: (input: unknown) => Entity;
  }
};