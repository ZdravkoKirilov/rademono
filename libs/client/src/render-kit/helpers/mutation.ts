import { get, isArray, isUndefined } from "lodash";

import { toDictionary } from "@app/shared";

import {
  RzElement, Component,
  createComponent, mountComponent, unmountComponent,
  isPrimitiveComponent, isCustomComponent, AbstractContainer, callWithErrorPropagation
} from "../internal";
import { RzRenderedNode, isRzElement, RzElementPrimitiveProps } from "../models";

export const updateComponent = (component: Component, rendered: RzRenderedNode) => {
  if (isPrimitiveComponent(component)) {
    component.update();
  } else {
    updateContainer(rendered, component, component.container);
  }
};

export const updateContainer = (newChildren: RzRenderedNode, component: Component, container: AbstractContainer) => {
  const currentChildren = component._children;

  if (Array.isArray(newChildren)) {

    component._children = newChildren.reduce((acc, item, index) => {

      if (isArray(item)) {

        const existing = currentChildren[index] as Array<Component | null>;
        acc = [...acc, updateKeyedChildren(item, existing, component, container)];

        return acc;
      } else {

        if (isRzElement(item)) {

          const existing = currentChildren[index] as Component | null;
          acc = [...acc, updateChild(existing, item, component, container)];

          return acc;
        }

        acc = [...acc, null];
        return acc;

      }

    }, [] as Array<Component | null | Array<Component | null>>);

  } else {
    
    const existing = currentChildren[0] as Component | null;
    component._children = [updateChild(existing, newChildren, component, container)];
  }
};

export const updateKeyedChildren = (
  newChildren: Array<RzElement | null>,
  currentChildren: Array<Component | null>,
  component: Component,
  mountTo: AbstractContainer,
): Array<Component | null> => {

  const result = newChildren.map(newChildElement => {
    if (isRzElement(newChildElement)) {
      const key = get(newChildElement.props, 'key');

      if (!key) {
        throw new Error('Each element in a keyed collection must have a "key" prop. Shame.');
      }

      const childWithSameKey = currentChildren[key];

      if (childWithSameKey) {
        updateComponentPropsByType(childWithSameKey, newChildElement);
        return childWithSameKey;
      } else {
        const newChild = createComponent(newChildElement, component.meta.engine.factory, component.meta, component);
        mountComponent(newChild, mountTo);
        updateComponentPropsByType(newChild, newChildElement);
        return newChild;
      }
    }
    return null;
  });

  const indexedNewChildren = toDictionary(component.children, 'props.key');

  Object.entries(currentChildren).map(([key, component]) => {
    if (isUndefined(indexedNewChildren[key]) && component) {
      unmountComponent(component);
    }
  });

  return result;

};

const updateChild = (
  currentChild: Component | null,
  incomingChild: RzElement | null,
  component: Component,
  container: AbstractContainer
): Component | null => {

  if (currentChild && incomingChild) {

    const sameType = currentChild.type === incomingChild.type;
    if (sameType) {
      updateComponentPropsByType(currentChild, incomingChild);
      return currentChild;
    } else {
      const newInstance = createComponent(incomingChild, component.meta.engine.factory, component.meta, component);
      mountComponent(newInstance, container);
      unmountComponent(currentChild);
      return newInstance;
    }
  }

  if (currentChild && !incomingChild) {
    unmountComponent(currentChild);
    return null;
  }

  if (!currentChild && incomingChild) {
    const newInstance = createComponent(incomingChild, component.meta.engine.factory, component.meta, component);
    mountComponent(newInstance, container);
    return newInstance;
  }

  return null;
};

const updateComponentPropsByType = (target: Component, updated: RzElement) => {

  if (isCustomComponent(target)) {
    callWithErrorPropagation(target.parent, () => target.updateProps(updated.props));
  }

  if (isPrimitiveComponent(target)) {
    target.updateProps(updated.props as RzElementPrimitiveProps);
  }

  throw new Error('Unrecognized component child: ' + JSON.stringify(target));

};



