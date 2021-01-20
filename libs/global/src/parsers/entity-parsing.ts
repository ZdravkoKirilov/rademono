import { isArray, get } from 'lodash';

import { GameTemplate } from '../game-entities';
import { Dictionary } from '../types';

const parseFromString = <T = any>(context: Dictionary) => (src: string): T => {
  try {
    const result = new Function('with(this) {' + src + '}').call(context);
    return result !== undefined ? result : '';
  } catch (err) {
    return '' as any;
  }
};

export const parseAndBind = <T = Function>(context: Dictionary) => (
  src: string,
): T => {
  const func = parseFromString(context)(src) as Function;
  return typeof func === 'function' ? func.bind(context) : func;
};

export const safeJSON = <T = {}>(source: any, fallback?: unknown): T => {
  if (typeof source === 'string') {
    try {
      return JSON.parse(source);
    } catch {
      return fallback as T;
    }
  } else {
    return source;
  }
};

type ParseConfig<T> = Partial<
  {
    [K in keyof T]: string | ((item: any) => any);
  }
>;

export const enrichEntity = <T, P>(
  config: GameTemplate,
  parseConfig: ParseConfig<T>,
  source: T,
): P => {
  const draft = { ...source };

  for (const key in parseConfig) {
    const parser = parseConfig[key] as any;
    const currentPropertyValue = draft[key];

    if (typeof parser === 'string') {
      draft[key] = get(config, [parser, source[key] as any], null);
    }
    if (typeof parser === 'function') {
      if (isArray(currentPropertyValue)) {
        draft[key] = currentPropertyValue.map((elem) => {
          return parser(elem);
        }) as any;
      } else {
        draft[key] = parser(currentPropertyValue);
      }
    }
  }
};
