import { Tagged } from './Tagged';

export type StringOfLength<Min extends number, Max extends number> = Tagged<
  'StringOfLength',
  {
    min: Min;
    max: Max;
  } & string
>;

export const StringOfLength = {
  generate: <Min extends number, Max extends number>(source: string) =>
    source as StringOfLength<Min, Max>,
};
