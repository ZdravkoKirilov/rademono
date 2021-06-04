import { omit } from 'lodash/fp';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Tagged<T extends string, U = {}> = {
  readonly __tag: T;
} & U;

export type UnTagged<T> = Omit<T, '__tag'>;

export const toTagged = <U>(tagName: string, other?: Omit<U, '__tag'>) => {
  return { __tag: tagName, ...(other || {}) } as Tagged<typeof tagName, U>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const unTag = <T extends object>(data: T) => {
  return omit('__tag', data) as UnTagged<T>;
};
