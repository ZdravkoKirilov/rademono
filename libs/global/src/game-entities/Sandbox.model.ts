import { Omit, Nominal } from 'simplytyped';
import { isObject, omit, values } from 'lodash/fp';

import { GameEntityParser } from "./Base.model";
import { ExpressionFunc, ParamedExpressionFunc } from './Expression.model';
import { toWidgetId, Widget, WidgetId } from './Widget.model';
import { Module, ModuleId, toModuleId } from './Module.model';
import { toNodeId, WidgetNode, WidgetNodeId } from './WidgetNode.model';
import { Token, TokenId, toTokenId } from './Token.model';
import { Tagged } from '../types';
import { enrichEntity, parseAndBind } from '../shared';

export enum SandboxType {
  'widget' = 'widget',
  'module' = 'module',
  'node' = 'node',
  'token' = 'token',
};

export type SandboxId = Nominal<string, 'SandboxId'>;
export const toSandboxId = (source: unknown) => String(source) as SandboxId;

type StatefulComponent = {};

export type Sandbox = Tagged<'Sandbox', {
  id: SandboxId;
  name: string;
  description: string;
  /* shared */
  global_state: string;
  own_data: string; // player data, preferences
  on_init: string; // assertions may go here

  /* identifiers */
  widget: WidgetId;
  node: WidgetNodeId;
  token: TokenId;
  module: ModuleId;

  from_parent: string;
}>;

export type DtoSandbox = Omit<Sandbox, '__tag' | 'id' | 'widget' | 'node' | 'token' | 'module'> & {
  id: number;

  widget: number;
  node: number;
  token: number;
  module: number;
};

export type RuntimeSandbox = Omit<Sandbox, 'global_state' | 'own_data' | 'on_init' | 'from_parent' | 'widget' | 'module' | 'token'> & Partial<{

  global_state: ExpressionFunc<{}>;
  own_data: ExpressionFunc<{}>;
  on_init: ParamedExpressionFunc<StatefulComponent, void>;

  from_parent: ExpressionFunc<{}>;

  node: WidgetNode;
  widget: Widget;
  module: Module;
  token: Token;
}>;

export const Sandbox: GameEntityParser<Sandbox, DtoSandbox, RuntimeSandbox> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Sandbox',
        ...input
      } as Sandbox;
    },

  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Sandbox',
      id: toSandboxId(dto.id),
      module: toModuleId(dto.module),
      token: toTokenId(dto.token),
      widget: toWidgetId(dto.widget),
      node: toNodeId(dto.node),
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      module: Number(entity.module),
      token: Number(entity.token),
      widget: Number(entity.widget),
      node: Number(entity.node),
    };
  },

  toRuntime(context, sandbox) {

    return enrichEntity<Sandbox, RuntimeSandbox>(context.conf, {

      global_state: src => parseAndBind(context)(src),
      own_data: src => parseAndBind(context)(src),
      on_init: src => parseAndBind(context)(src),
      from_parent: src => parseAndBind(context)(src),

      node: (nodeId: WidgetNodeId) => {
        const widgets = context.conf.widgets;
        return values(widgets)
          .reduce<WidgetNode[]>((allNodes, widget) => { return [...allNodes, ...widget.nodes] }, [])
          .find(node => node.id === nodeId)
      },
      widget: 'widgets',
      module: 'modules',
      token: 'tokens',
    }, sandbox);

  }
}