import { get, isArray, isFunction, isObject } from "lodash";

import {
  AbstractRenderEngine, GenericEventHandler, Component,
  ContextManager, AssetManager, PRIMS, RzEventTypes, CustomComponent
} from "../internal";
import { ComponentConstructor } from "./Component";

export type RzElement<T extends Partial<RzElementProps> = {}> = {
  type: RzElementType;
  props: Readonly<T>;
  children: RzElementChildren;
};


/* It's always an array
1. Could be an array of RzElement or null
2. Could be a nested array of the former which will be considered a keyed collection
   by the mutation handlers
*/
type RzElementChildren = Array<RzElement | null | Array<RzElement | null>>;

/* a component could render either a null, a single RzElement or an array of the former */
export type RzRenderedNode = null | RzElement | Array<RzElement | null>;

export type RzElementPrimitiveProps = Partial<DefaultEvents> & RzElementProps & {
  styles?: Partial<RzStyles>;
};

export type RzElementProps = {

  id?: string | number;
  name?: string;
  points?: Points;
  key?: string | number;

  children: RzRenderedNode;
};

export type RzElementType<T = any> = PrimitiveType | ComponentConstructor<T>;

export const isOfPrimitiveType = (type: any): type is PrimitiveType => {
  return new Set(Object.values(PRIMS)).has(type as any)
};

export const isCustomType = (type: any): type is CustomComponent => {
  return isFunction(type) && get(type.prototype, '__custom_component__') === true;
};

export const isRzElementType = (type: any): type is RzElementType => {
  return isOfPrimitiveType(type) || isCustomType(type);
};

export const isRzElement = (source: unknown): source is RzElement => {
  const type = get(source, 'type');
  const props = get(source, 'props');
  const children = get(source, 'children');

  const propsAreValid = isObject(props);
  const childrenAreValid = isArray(children);

  return isRzElementType(type) && propsAreValid && childrenAreValid;
};

export type RzStyles = {
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

export type RzTextStyles = Partial<Pick<RzStyles, 'stroke_color' | 'stroke_thickness' | 'fill' | 'font_family' | 'font_size' | 'font_style' | 'x' | 'y'>>

export const FONT_STYLES = {
  bold: 'bold',
  italic: 'italic',
  normal: 'normal',
} as const;

type FontStyle = keyof typeof FONT_STYLES;

export type Points = Array<[number, number]>;
export type RzPoint = { x: number, y: number };
export type RzSize = { width: number, height: number };

export type MetaProps = {
  engine: AbstractRenderEngine;
  context: ContextManager;
  assets: AssetManager;
  root: Component;
};

export type PrimitiveType = keyof typeof PRIMS;

export type DefaultEvents = {
  [key in RzEventTypes]: GenericEventHandler;
};