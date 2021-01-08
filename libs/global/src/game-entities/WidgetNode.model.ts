import { Omit, Nominal } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import { GameEntityParser, WithStyle } from "./Base.model";
import { Shape, ShapeId, toShapeId } from "./Shape.model";
import { Token, TokenId, toTokenId } from "./Token.model";
import { toWidgetId, Widget, WidgetId } from "./Widget.model";
import {
  ParamedExpressionFunc, EventHandlingExpressionFunc, LifecycleExpressionFunc, ContextSubscribingFunc,
  SonataGetterFunc
} from "./Expression.model";
import { Text, TextId, toTextId } from "./Text.model";
import { Sonata, SonataId, toSonataId } from "./Sonata.model";
import { Module, ModuleId, toModuleId } from "./Module.model";
import { ImageAsset, ImageAssetId, toImageId } from './ImageAsset.model';
import { CoreStyles, Style } from './Style.model';
import { Tagged } from '../types';
import { enrichEntity, parseAndBind, safeJSON } from '../parsers';

export type WidgetNodeId = Nominal<string, 'WidgetNodeId'>;
export const toNodeId = (source: unknown) => String(source) as WidgetNodeId;

export type WidgetNode = WithStyle & Tagged<'WidgetNode', {
  id: WidgetNodeId;
  owner: WidgetId;

  name: string;
  description: string;

  token: TokenId;
  shape: ShapeId;
  module: ModuleId;
  widget: WidgetId;
  image: ImageAssetId;
  text: TextId;
  dynamic_text: string;

  provide_context: string;
  consume_context: string;

  pass_to_children: string;

  handlers: NodeHandler[];
  lifecycles: NodeLifecycle[];
}>;

export type DtoWidgetNode = Omit<WidgetNode, '__tag' | 'id' | 'module' | 'owner' | 'token' | 'shape' | 'widget' | 'image' | 'text' | 'handlers' | 'lifecycles'> & {
  id: number;
  owner: number;
  module: number;
  widget: number;
  token: number;
  image: number;
  text: number;
  shape: number;
  handlers: DtoNodeHandler[];
  lifecycles: DtoNodeLifecycle[];
};

export type RuntimeWidgetNode = Omit<WidgetNode, 'module' | 'token' | 'shape' | 'text' | 'widget' | 'image' | 'style' | 'style_inline' | 'provide_context' | 'consume_context' | 'pass_to_children'> & {

  token: Token;
  shape: Shape;
  widget: Widget;
  module: Module;
  image: ImageAsset;
  dynamic_text: ParamedExpressionFunc<{ node: RuntimeWidgetNode, component: {} }, Text>;
  text: Text;

  style: ParamedExpressionFunc<{ node: RuntimeWidgetNode, component: {} }, Style>;
  style_inline: CoreStyles;

  provide_context: ParamedExpressionFunc<{ node: RuntimeWidgetNode, component: {} }, any>; // provideValueToSubscribers
  consume_context: ContextSubscribingFunc;

  pass_to_children: ParamedExpressionFunc<{ node: RuntimeWidgetNode, component: {} }, any>;
};

export const WidgetNode: GameEntityParser<WidgetNode, DtoWidgetNode, RuntimeWidgetNode> & WidgetNodeOperations = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'WidgetNode',
        ...input
      } as WidgetNode;
    },

  },

  toRuntime(context, node) {
    return enrichEntity<WidgetNode, RuntimeWidgetNode>(context.conf, {
      style: src => parseAndBind(context)(src),
      style_inline: value => safeJSON(value, null),
      dynamic_text: src => parseAndBind(context)(src),
      consume_context: src => parseAndBind(context)(src),
      provide_context: src => parseAndBind(context)(src),
      pass_to_children: src => parseAndBind(context)(src),

      text: 'texts',
      widget: 'widgets',
      module: 'modules',
      shape: 'shapes',
      image: 'images',
      token: 'tokens',
    }, node);

  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      owner: Number(entity.owner),

      widget: Number(entity.widget),
      module: Number(entity.module),
      token: Number(entity.token),
      image: Number(entity.image),
      text: Number(entity.text),
      shape: Number(entity.shape),

      handlers: entity.handlers.map(elem => NodeHandler.toDto(elem)),
      lifecycles: entity.lifecycles.map(elem => NodeLifecycle.toDto(elem)),
    };
  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'WidgetNode',
      id: toNodeId(dto.id),
      owner: toWidgetId(dto.owner),
      module: toModuleId(dto.module),
      widget: toWidgetId(dto.widget),
      token: toTokenId(dto.token),
      text: toTextId(dto.text),
      shape: toShapeId(dto.shape),
      image: toImageId(dto.image),

      handlers: dto.handlers.map(elem => NodeHandler.toEntity(elem)),
      lifecycles: dto.handlers.map(elem => NodeLifecycle.toEntity(elem)),
    };
  },

  saveHandler(node, handler) {
    return {
      ...node,
      handlers: node.handlers.map(elem => elem.id === handler.id ? handler : elem)
    };
  },

  saveLifecycle(node, lifecycle) {
    return {
      ...node,
      lifecycles: node.lifecycles.map(elem => elem.id === lifecycle.id ? lifecycle : elem)
    };
  },

  removeHandler(node, handler) {
    return {
      ...node,
      handlers: node.handlers.filter(elem => elem.id !== handler.id)
    };
  },

  removeLifecycle(node, lifecycle) {
    return {
      ...node,
      lifecycles: node.lifecycles.filter(elem => elem.id !== lifecycle.id)
    };
  },
}

type WidgetNodeOperations = {
  saveHandler: (node: WidgetNode, handler: NodeHandler) => WidgetNode;
  saveLifecycle: (node: WidgetNode, handler: NodeLifecycle) => WidgetNode;
  removeHandler: (node: WidgetNode, handler: NodeHandler) => WidgetNode;
  removeLifecycle: (node: WidgetNode, handler: NodeLifecycle) => WidgetNode;
}

export type NodeHandlerId = Nominal<string, "NodeHandlerId">;
export const toHandlerId = (source: unknown) => String(source) as NodeHandlerId;

export enum EventType {
  onClick = 'onClick',

  onPointerDown = 'onPointerDown',
  onPointerUp = 'onPointerUp',
  onPointerUpOutside = 'onPointerUpOutside',
  onPointerOver = 'onPointerOver',
  onPointerOut = 'onPointerOut',
  onPointerMove = 'onPointerMove',

  onDragEnd = 'onDragEnd',
  onDragMove = 'onDragMove',
  onScroll = 'onScroll',
  onScrollEnd = 'onScrollEnd',

  onWheel = 'onWheel',
  onKeypress = 'onKeypress',
  onFocus = 'onFocus',
  onBlur = 'onBlur',

  onChange = 'onChange',
};

export type NodeHandler = Tagged<'NodeHandler', {
  id: NodeHandlerId;
  owner: WidgetNodeId;

  name: string;
  description: string;

  type: EventType;
  effect: string; // Expression
  dynamic_sound: string; // Expression -> Sonata
  sound: SonataId;
}>;

export type DtoNodeHandler = Omit<NodeHandler, '__tag' | 'id' | 'owner' | 'sound' | 'type'> & {
  id: number;
  owner: number;
  sound: number;
  type: string;
};

export type RuntimeNodeHandler = Omit<NodeHandler, 'effect' | 'sound' | 'dynamic_sound'> & {
  effect: EventHandlingExpressionFunc;
  dynamic_sound: SonataGetterFunc;
  sound: Sonata;
};

export const NodeHandler: GameEntityParser<NodeHandler, DtoNodeHandler, RuntimeNodeHandler> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'NodeHandler',
        ...input
      } as NodeHandler;
    },

  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'NodeHandler',
      id: toHandlerId(dto.id),
      owner: toNodeId(dto.owner),
      sound: toSonataId(dto.sound),
      type: dto.type as EventType,
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      owner: Number(entity.owner),
      sound: Number(entity.sound),
    };
  },

  toRuntime(context, handler) {
    const config = context.conf;
    return enrichEntity<NodeHandler, RuntimeNodeHandler>(config, {
      effect: src => parseAndBind(context)(src),
      dynamic_sound: src => parseAndBind(context)(src),
      sound: 'sonatas',
    }, handler);
  }
}

export type NodeLifecycleId = Nominal<string, "NodeLifecycleId">;
export const toLifecycleId = (source: unknown) => String(source) as NodeLifecycleId;

export type NodeLifecycle = Tagged<'NodeLifecycle', {
  id: NodeLifecycleId;
  owner: WidgetNodeId;

  name: string;
  description: string;

  type: NODE_LIFECYCLES;

  effect: string;

  dynamic_sound: string; // Expression -> Sonata
  sound: SonataId;
}>

export type DtoNodeLifecycle = Omit<NodeLifecycle, '__tag' | 'id' | 'owner' | 'sound' | 'type'> & {
  id: number;
  owner: number;
  sound: number;
  type: string;
}

export type RuntimeNodeLifecycle = Omit<NodeLifecycle, 'effect' | 'sound' | 'dynamic_sound'> & Partial<{
  effect: LifecycleExpressionFunc;

  dynamic_sound: SonataGetterFunc;
  sound: Sonata;
}>;

export const NodeLifecycle: GameEntityParser<NodeLifecycle, DtoNodeLifecycle, RuntimeNodeLifecycle> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'NodeLifecycle',
        ...input
      } as NodeLifecycle;
    },

  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'NodeLifecycle',
      id: toLifecycleId(dto.id),
      owner: toNodeId(dto.owner),
      sound: toSonataId(dto.sound),
      type: dto.type as NODE_LIFECYCLES,
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      owner: Number(entity.owner),
      sound: Number(entity.sound),
    };
  },

  toRuntime(context, lifecycle) {
    return enrichEntity<NodeLifecycle, RuntimeNodeLifecycle>(context.conf, {
      effect: src => parseAndBind(context)(src),
      dynamic_sound: src => parseAndBind(context)(src),
      sound: 'sonatas',
    }, lifecycle);
  }
};

export enum NODE_LIFECYCLES {
  'onUpdate' = 'onUpdate',
  'onMount' = 'onMount',
  'onUnmount' = 'onUnmount',
};