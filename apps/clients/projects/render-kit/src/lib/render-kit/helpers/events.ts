import { get } from "lodash";

import { GenericEvent, GenericEventHandler, Component, callWithErrorPropagation } from "../internal";

export const propagateEvent = (event: GenericEvent, handlerName: RzEventTypes) => {
  if (!event.propagationStopped) {
    let parent: Component | undefined = event.currentTarget.parent;

    if (parent) {
      do {
        const handler: GenericEventHandler = get(parent.props, handlerName);
        if (handler) {
          callWithErrorPropagation(parent, () => handler(event));
        }
        parent = parent.parent;
      } while (parent && !event.propagationStopped);
    }
  }
};

export enum RzEventTypes {
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

export const isGenericEventType = (name: string): name is RzEventTypes => {
  return name in RzEventTypes;
};