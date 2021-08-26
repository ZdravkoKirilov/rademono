import { isURL, isString } from 'class-validator';

import { Tagged } from './Tagged';

export type Url = Tagged<'Url', string>;

export const isValidUrl = (source: unknown): source is Url =>
  isString(source) && isURL(source);
