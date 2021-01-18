import { v4 } from 'uuid';

import { Tagged } from './Tagged';

export type UUIDv4 = Tagged<'__UUIDv4__', string>;

const generate = <T extends UUIDv4>() => v4() as T;

export const UUIDv4 = { generate };
