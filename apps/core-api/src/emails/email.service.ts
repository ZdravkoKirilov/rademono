import { Inject, Injectable } from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable } from 'rxjs';

import {
  Email,
  EmailType,
  Primitive,
  PrivateEmailEntity,
  switchMapEither,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { PUBLIC_ID_GENERATOR } from '@app/shared';
import { EmailRepository } from './email.repository';

@Injectable()
export class EmailService {
  constructor(
    private repo: EmailRepository,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}

  createLoginCodeEmail(
    recipientEmail: Email,
  ): Observable<e.Either<UnexpectedError, PrivateEmailEntity>> {
    const data: Omit<Primitive<PrivateEmailEntity>, 'public_id'> = {
      from: 'noreply@oblache.tech',
      to: recipientEmail,
      type: EmailType.signin,
      subject: 'Sign in code',
      html: 'vlachi bre',
    };

    return PrivateEmailEntity.create(data, this.createId).pipe(
      switchMapEither(
        (err) => {
          return toLeftObs(
            new UnexpectedError('Failed to create an email', err),
          );
        },
        (res) =>
          this.repo.createEmail(res).pipe(
            switchMapEither(
              (err) =>
                toLeftObs(
                  new UnexpectedError('Failed to create an email', err),
                ),
              (saved) => toRightObs(saved),
            ),
          ),
      ),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Failed to create an email', err)),
      ),
    );
  }
}
