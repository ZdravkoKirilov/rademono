import { isString } from "lodash/fp";
import validator from "validator";
import * as o from 'fp-ts/lib/Option';

import { Never } from "./Never";

export type Url<A extends string = string> = A & Never<"__Url__">;

const NotAValidUrl = 'NotAValidUrl';

const parse = (value: unknown): o.Option<Url> => {
  const trimmed = isString(value) ? value.trim() : '';
  return validator.isURL(trimmed) ? o.some(trimmed as Url) : o.none;
};

export const Url = { parse, NotAValidUrl };
