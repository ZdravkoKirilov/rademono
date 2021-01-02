import { v4, validate } from "uuid";
import * as o from 'fp-ts/lib/Option';

import { Never } from "./Never";

export type UUIDv4 = string & Never<"__UUIDv4__">;

const NotAValidUUID = 'NotAValidUUID';

const parse = (value: unknown): o.Option<UUIDv4> => {
  return validate(String(value)) ? o.some(value as UUIDv4) : o.none
};

const generate = <T extends UUIDv4>() => v4() as T;

export const UUIDv4 = { parse, generate, NotAValidUUID };