import { isURL, isString } from 'class-validator';
import { Nominal } from './Nominal';

export type Url = Nominal<string>;

export const isValidUrl = (source: unknown): source is Url =>
  isString(source) && isURL(source);
