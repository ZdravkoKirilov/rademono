import { UUIDv4 } from '../types';

export type GameId = UUIDv4 & { readonly _: unique symbol };

export class Game {}
