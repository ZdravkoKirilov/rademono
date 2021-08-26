import { Nominal } from './Nominal';

export type StringOfLength<Min extends number, Max extends number> = Nominal<
  {
    min: Min;
    max: Max;
  } & string
>;
