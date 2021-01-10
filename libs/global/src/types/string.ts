import { Never } from '../types/Never';

export type StringOfLength<Min extends number, Max extends number> = Never<'StringOfLength'> & {
  min: Min,
  max: Max,
};