import { get, isFunction } from 'lodash';

import { Component } from "../internal";

export const callWithErrorPropagation = <Returns>(parent: Component | undefined, callback: Function): Returns => {
  try {
    const result = callback();
    return result as Returns;
  } catch (err) {
    let nextAncestor = parent as any;
    let stack = [] as any[];

    while (nextAncestor) {
      if (isFunction(nextAncestor?.didCatch)) {
        callWithErrorPropagation(nextAncestor.parent, () => nextAncestor.didCatch(err, stack.reverse().join(' \n')));
        nextAncestor = null;
      } else {
        nextAncestor = nextAncestor.parent;
        const typeName = typeof get(nextAncestor, 'type') === 'string' ?
          nextAncestor.type :
          get(nextAncestor, ['type', 'name']) || get(nextAncestor, ['type', 'displayName']) || '';
        const givenName = get(nextAncestor, ['props', 'name']);
        const composedName = givenName ? `${typeName}[${givenName}]` : '';
        stack.push(composedName || typeName || 'Anonymous');
      }
    }

    throw err;
  }

};