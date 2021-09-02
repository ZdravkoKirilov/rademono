import { isURL, isString } from 'class-validator';

export type Url<Т extends string = ''> = string & {
  readonly _: unique symbol;
};

export const isValidUrl = <T extends string>(
  source: unknown,
): source is Url<T> => isString(source) && isURL(source);

export const Url = {
  generate: <T extends string>(source: T) => (source as unknown) as Url<T>,
  isValid: isValidUrl,
};
