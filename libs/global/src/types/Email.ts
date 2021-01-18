import { Tagged } from './Tagged';

export type Email = Tagged<'__Email__', string>;

const generate = <T extends Email>(from: string) => from as T;

export const Email = { generate };
