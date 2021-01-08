import { Omit, Nominal } from 'simplytyped';
import { omit, isObject } from 'lodash/fp';

import { enrichEntity, parseAndBind } from '../parsers';
import { GenericSubscription, Tagged } from '../types';

import { BaseModel, GameEntityParser } from "./Base.model";
import { Sonata } from "./Sonata.model";
import { RuntimeWidgetNode } from "./WidgetNode.model";
import { toModuleId } from './Module.model';

export type ExpressionId = Nominal<string, 'ExpressionId'>;
export const toExpressionId = (source: unknown) => String(source) as ExpressionId;

type GenericEvent = {};
type StatefulComponent = {};
type DidUpdatePayload = {};

export type Expression = Tagged<'Expression', BaseModel<ExpressionId> & {
  code: string;
}>;

export type DtoExpression = Omit<Expression, '__tag' | 'id' | 'module'> & {
  id: number;
  module: number;
};

export const Expression: GameEntityParser<Expression, DtoExpression, RuntimeExpression> = {

  fromUnknown: {

    toEntity(input: unknown) {
      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Expression',
        ...input
      } as Expression;
    },

  },

  toDto(expression) {
    return {
      ...omit('__tag', expression),
      id: Number(expression.id),
      module: Number(expression.module),
    };
  },

  toEntity(dtoExpression) {
    return {
      ...dtoExpression,
      __tag: 'Expression',
      id: toExpressionId(dtoExpression.id),
      module: toModuleId(dtoExpression.module),
    };
  },

  toRuntime(context, expression) {
    return enrichEntity<Expression, RuntimeExpression>(context.conf, {
      code: (src: string) => parseAndBind(context)(src)
    }, expression);
  },

};

export type RuntimeExpression<T = ParamedExpressionFunc> = Omit<Expression, 'code'> & {
  code: T;
};

export type ParamedExpressionFunc<T = {}, ReturnType = any> = (payload: T) => ReturnType;

export type ExpressionFunc<ReturnType = any> = () => ReturnType;

export type EventHandlingExpressionFunc<T = any> = (
  component: StatefulComponent,
  event: GenericEvent,
) => T | T[];

export type LifecycleExpressionFunc<T = any> = (
  component: StatefulComponent,
  payload?: DidUpdatePayload,
) => T | T[];

export type ContextSubscribingFunc = ParamedExpressionFunc<{
  node: RuntimeWidgetNode,
  component: StatefulComponent
}, GenericSubscription[] | string[]>

export type SonataGetterFunc = ParamedExpressionFunc<StatefulComponent, Sonata>;
