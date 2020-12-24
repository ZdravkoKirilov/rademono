import { isNull } from "lodash";

import { RzElementType, Component, findInAncestors } from "../../internal";

export const findContextProvider = (startFrom: Component, parentName?: string, key?: RzElementType) => {

  let matcher = null;

  if (parentName) {
      matcher = { name: parentName };
  }

  if (key) {
    matcher = key;
  }

  if (isNull(matcher)) {
    throw new Error('Unrecognized ContextProvider matcher: ' + key);
  }

  const providerContext = findInAncestors(startFrom)(matcher);

  return providerContext;
};