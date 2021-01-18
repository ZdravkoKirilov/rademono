import { Branded } from './Branded';

export type Email = string & Branded<'__Email__'>;

const generate = <T extends Email>(from: string) => from as T;

export const Email = { generate };
