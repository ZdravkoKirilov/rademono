import { Branded } from '../types/Branded';

export type StringOfLength<
  Min extends number,
  Max extends number
> = Branded<'StringOfLength'> & {
  min: Min;
  max: Max;
};
