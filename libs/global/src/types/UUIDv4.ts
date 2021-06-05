import { v4 } from 'uuid';

declare const validUUIDv4: unique symbol;

export type UUIDv4 = string & {
  [validUUIDv4]: true;
};

const generate = <T extends string>() => v4() as T;

export const UUIDv4 = { generate };
