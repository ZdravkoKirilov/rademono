import { isString } from "lodash/fp";
import validator from "validator";
import { Never } from "./Never";

import { Tagged, toTagged } from "./Tagged";

export type Url<A extends string = string> = A & Never<"__Url__">;

const NotAValidUrl = 'NotAValidUrl';

type ParseError = Tagged<typeof NotAValidUrl>;

export const parse = (value: unknown): Url | ParseError => {
  if (!isString(value)) {
    return toTagged(NotAValidUrl);
  }
  if (!validator.isURL(value.trim())) {
    return toTagged(NotAValidUrl);
  }
  return value as Url;
}
  