import { Nominal } from './Nominal';

export type Email = Nominal<string>;

const generate = <T extends Email>(from: string) => from as T;

export const Email = { generate };
