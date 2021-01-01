import { v4, validate } from "uuid";
import { Never } from "./Never";
import { Tagged, toTagged } from "./Tagged";

export type UUIDv4 = string & Never<"__UUIDv4__">;

type ParseError = Tagged<'NotAValidUUID'>;

const parse = (value: unknown): UUIDv4 | ParseError => {
  const asString = String(value);
  return validate(asString) ? asString as UUIDv4 : toTagged('NotAValidUUID')
};

const generate = <T extends UUIDv4>() => v4() as T;

export const UUIDv4 = { parse, generate };