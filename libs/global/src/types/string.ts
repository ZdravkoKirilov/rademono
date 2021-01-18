import { Tagged } from './Tagged';

export type StringOfLength<
  Min extends number,
  Max extends number
> = Tagged<'StringOfLength'> & {
  min: Min;
  max: Max;
};
