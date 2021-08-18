import { Injectable } from '@nestjs/common';

import {
  mapEither,
  Primitive,
  PrivateEmailEntity,
  toLeftObs,
  UnexpectedError,
  RepositoryError,
  left,
  right,
  Either,
  Observable,
  catchError,
} from '@end/global';
import { DbentityService } from '@app/database';

type EmailDBModel = Primitive<PrivateEmailEntity>;

@Injectable()
export class EmailRepository {
  constructor(private model: DbentityService<EmailDBModel>) {}

  createEmail(
    payload: PrivateEmailEntity,
  ): Observable<Either<RepositoryError | UnexpectedError, PrivateEmailEntity>> {
    return this.model.insert(payload).pipe(
      mapEither(
        (err) => left(new RepositoryError('Failed to save the email', err)),
        () => right(payload),
      ),
      catchError((err) => {
        return toLeftObs(new UnexpectedError('Failed to save the email', err));
      }),
    );
  }
}
