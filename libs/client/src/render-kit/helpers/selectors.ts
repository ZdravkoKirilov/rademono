import { isEmpty, isObject, get } from 'lodash';

import { Dictionary } from "@app/shared";

import { Component, RzElementType, isRzElementType } from "../internal";


export const isDescendantOf = (target: Component, potentialParent: Component): boolean => {

  const isDirectChild = potentialParent.children.includes(target);

  return isDirectChild || potentialParent.children.some(child => child ? isDescendantOf(target, child) : false);

};

const matchByProp = (predicate: Dictionary) => (target: Component) => {

  return Object.keys(predicate).every(key => {
    const actualPropValue = get(target, ['props', ...key.split('.')]);

    return actualPropValue === predicate[key];
  });

};

const matchByType = (type: RzElementType) => (target: Component) => {
  return get(target, 'type') === type;
};

export const findInDescendants = (startPoint: Component) => (criteria: Dictionary | RzElementType): Component | null => {

  if (isRzElementType(criteria)) {
    const matcher = matchByType(criteria);
    return iterateUntil('child', matcher)(startPoint) as Component | null;
  }

  if (isObject(criteria) && !isEmpty(criteria)) {
    const matcher = matchByProp(criteria);
    return iterateUntil('child', matcher)(startPoint) as Component | null;
  }

  return null;
};

export const findInAncestors = (startPoint: Component) => (criteria: Dictionary | RzElementType): Component | null => {

  if (isRzElementType(criteria)) {
    const matcher = matchByType(criteria);
    return iterateUntil('parent', matcher)(startPoint) as Component | null;
  }
  if (isObject(criteria) && !isEmpty(criteria)) {
    const matcher = matchByProp(criteria);
    return iterateUntil('parent', matcher)(startPoint) as Component | null;
  }
  return null;

};

export const findInSiblings = (startPoint: Component) => (criteria: Dictionary | RzElementType): Component | null => {

  if (isRzElementType(criteria)) {

    const matcher = matchByType(criteria);
    return iterateUntil('sibling', matcher)(startPoint) as Component | null;
  }

  if (isObject(criteria) && !isEmpty(criteria)) {

    const matcher = matchByProp(criteria);
    return iterateUntil('sibling', matcher)(startPoint) as Component | null;
  }

  return null;
};

const iterateUntil = (
  direction: 'parent' | 'child' | 'sibling',
  matcher: (target: Component) => boolean
) => (target: Component): Component | null => {

  if (direction === 'parent') {

    const parent = get(target, 'parent');

    if (parent) {
      if (matcher(parent)) {
        return parent;
      }
      return iterateUntil(direction, matcher)(parent);
    }

    return null;
  } else if (direction === 'child') {

    return breadthFirstSearch(target, matcher);

  } else if (direction === 'sibling') {

    const allSiblings: Component[] = get(target, ['parent', 'children'], []);
    return allSiblings.find(sibling => matcher(sibling)) || null;

  }

  throw new Error('Invalid selector direction: ' + direction);
};

const breadthFirstSearch = (target: Component, matcher: (target: Component) => boolean) => {
  const queue = [...target.children];
  let nextElement: Component | null = null;

  while (queue.length > 0) {

    nextElement = queue.shift() || null;

    if (nextElement && matcher(nextElement)) {
      break; // we found it
    }

    if (nextElement?.children) {
      for (let i = 0; i < nextElement.children.length; i++) { // next group for checkup
        queue.push(nextElement.children[i]);
      }
    }

  }

  return nextElement;
};

