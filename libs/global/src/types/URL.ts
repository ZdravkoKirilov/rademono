import { isURL, isString } from 'class-validator';

import { Tagged } from './Tagged';

export type Url<A extends string = string> = Tagged<'__Url__', A>;

export const isValidUrl = (source: unknown): source is Url =>
  isString(source) && isURL(source);
