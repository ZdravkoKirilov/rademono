import { Tagged } from './Tagged';

export type Url<A extends string = string> = Tagged<'__Url__', A>;
