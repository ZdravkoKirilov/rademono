import { v4 } from 'uuid';

import { Branded } from './Branded';

export type UUIDv4 = string & Branded<'__UUIDv4__'>;

const generate = <T extends UUIDv4>() => v4() as T;

export const UUIDv4 = { generate };
