import { flatten, isArray, isNull } from "lodash";

import { Omit } from '@app/shared';
import { RzElementProps, RzElement, RzElementType } from "../internal";
import { isRzElement, isRzElementType, RzRenderedNode } from "../models";

export type CustomProps = { [prop: string]: unknown; };

export type IntrinsicProps = Omit<RzElementProps, 'children'>;
type ReturnedProps = IntrinsicProps & { children: RzRenderedNode };

export const createElement = <T extends IntrinsicProps & CustomProps = {}>(
  type: RzElementType,
  props?: (Omit<T, 'children'> & IntrinsicProps) | null,
  ...children: RzRenderedNode[]
): RzElement<T & ReturnedProps> => {

  if (!isRzElementType(type)) {
    throw new TypeError('Invalid type passed to createElement: ' + type);
  }

  let computedChildren: RzRenderedNode = [];

  /* 
    Assumption: if total children length is 1, we assume:
    1. single RzElement child is transformed into a single item so that we could do
    return this.props.children instead of this.props.children[0] in CustomComponents
  */
  if (children.length === 1) {
    const firstChild = children[0];

    if (childIsSingleRzElement(firstChild) || isNull(firstChild)) {
      computedChildren = firstChild;
    } else if (isArray(firstChild)) {
      computedChildren = firstChild;
    } else {
      throw new Error('Unrecognized child element: ' + firstChild);
    }

  } else {
    computedChildren = flatten(children);
  }

  const newProps = { ...props || {} } as T & ReturnedProps;

  newProps['children'] = computedChildren;
  Object.freeze(props); // props are immutable

  return { type, props: newProps, children };
};

const childIsSingleRzElement = (child: unknown): child is RzElement => {
  return isRzElement(child);
};