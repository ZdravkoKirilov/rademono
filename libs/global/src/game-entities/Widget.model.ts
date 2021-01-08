import { Nominal, Omit } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import { ParamedExpressionFunc } from "./Expression.model";
import { BaseModel, GameEntityParser, WithStyle } from "./Base.model";
import { DtoWidgetNode, WidgetNode } from "./WidgetNode.model";
import { ImageAsset, ImageAssetId, toImageId } from './ImageAsset.model';
import { toModuleId } from './Module.model';
import { Tagged } from '../types';
import { enrichEntity, parseAndBind, safeJSON } from '../parsers';

export type WidgetId = Nominal<string, 'WidgetId'>;

export const toWidgetId = (source: string | number) => String(source) as WidgetId;

type StatefulComponent = {};
type RzNode = {};

export type Widget = BaseModel<WidgetId> & WithStyle & Tagged<'Widget', {

  get_nodes: string; // Expression => WidgetNode[]
  nodes: WidgetNode[];

  render: string;
  dynamic_background: string;
  background: ImageAssetId;
}>;

export type DtoWidget = Omit<Widget, '__tag' | 'id' | 'module' | 'nodes' | 'background'> & {
  id: number;
  module: number;
  background: number;
  nodes: DtoWidgetNode[];
}

export type RuntimeWidget = Omit<Widget, 'get_nodes' | 'render' | 'background' | 'dynamic_background'> & {
  get_nodes: ParamedExpressionFunc<WidgetExpressionPayload, WidgetNode[]>;
  dynamic_background: ParamedExpressionFunc<WidgetExpressionPayload, ImageAsset | Widget>;
  render: ParamedExpressionFunc<WidgetExpressionPayload, RzNode>;
  background: ImageAsset,
};

export const Widget: GameEntityParser<Widget, DtoWidget, RuntimeWidget> & WidgetOperations = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Widget',
        ...input
      } as Widget;
    },

  },

  toRuntime(context, widget) {
    return enrichEntity<Widget, RuntimeWidget>(context.conf, {
      get_nodes: src => parseAndBind(context)(src),
      dynamic_background: src => parseAndBind(context)(src),
      render: src => parseAndBind(context)(src),
      style: src => parseAndBind(context)(src),
      style_inline: src => safeJSON(src, {}),
      background: 'images',
    }, widget);
  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Widget',
      id: toWidgetId(dto.id),
      module: toModuleId(dto.id),
      background: toImageId(dto.background),
      nodes: dto.nodes.map(elem => WidgetNode.toEntity(elem))
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      module: Number(entity.module),
      background: Number(entity.background),
      nodes: entity.nodes.map(elem => WidgetNode.toDto(elem))
    };
  },

  saveNode(widget, node) {
    return {
      ...widget,
      nodes: widget.nodes.map(elem => elem.id === node.id ? node : elem)
    }
  },

  removeNode(widget, node) {
    return {
      ...widget,
      nodes: widget.nodes.filter(elem => elem.id !== node.id)
    };
  },
}

type WidgetOperations = {
  saveNode: (widget: Widget, node: WidgetNode) => Widget;
  removeNode: (widget: Widget, node: WidgetNode) => Widget;
}

type WidgetExpressionPayload = {
  widget: RuntimeWidget;
  component: StatefulComponent;
};






