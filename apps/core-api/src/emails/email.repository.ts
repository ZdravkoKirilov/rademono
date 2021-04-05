import { Injectable } from '@nestjs/common';
import * as e from 'fp-ts/lib/Either';
import { catchError } from 'rxjs/operators';

import {
  mapEither,
  Primitive,
  PrivateEmailEntity,
  toLeftObs,
  UnexpectedError,
  RepositoryError,
} from '@end/global';
import { DbentityService } from '@app/database';
import { Observable } from 'rxjs';

type EmailDBModel = Primitive<PrivateEmailEntity>;

@Injectable()
export class EmailRepository {
  constructor(private model: DbentityService<EmailDBModel>) {}

  createEmail(
    payload: PrivateEmailEntity,
  ): Observable<
    e.Either<RepositoryError | UnexpectedError, PrivateEmailEntity>
  > {
    return this.model.insert(payload).pipe(
      mapEither(
        (err) => e.left(new RepositoryError('Failed to save the email', err)),
        () => e.right(payload),
      ),
      catchError((err) => {
        return toLeftObs(new UnexpectedError('Failed to save the email', err));
      }),
    );
  }
}
