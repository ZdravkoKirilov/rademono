import * as e from 'fp-ts/lib/Either';
import { of } from 'rxjs';

export const toLeftObs = <T>(input: T) => {
  return of(e.left(input));
}