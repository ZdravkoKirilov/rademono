import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  MinLength,
  IsIn,
  IsOptional,
  IsDate,
} from 'class-validator';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import { omit } from 'lodash/fp';

import {
  Email,
  ParsingError,
  StringOfLength,
  UUIDv4,
  Primitive,
  Nominal,
} from '../types';
import { parseAndValidateUnknown, transformToClass } from '../parsers';

export type EmailId = Nominal<UUIDv4>;

export enum EmailType {
  signin = 'signin',
}

class EmailBase {
  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(EmailType))
  type: EmailType;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  from: Email;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  to: StringOfLength<1, 100>;

  @Expose()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  subject: StringOfLength<1, 100>;

  @Expose()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  html: StringOfLength<1, 5000>;

  @Expose()
  @IsOptional()
  @IsDate()
  deliveredOn?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  expiresOn?: Date;
}

export class EmailEntity extends EmailBase {
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  id: EmailId;
}

export class PrivateEmailEntity extends EmailBase {
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  public_id: EmailId;

  static create(
    payload: Primitive<EmailBase>,
    createId: typeof UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateEmailEntity>> {
    return parseAndValidateUnknown(
      {
        ...payload,
        public_id: createId(),
      },
      PrivateEmailEntity,
    ).pipe(
      map((result) => {
        if (e.isRight(result)) {
          return e.right(transformToClass(PrivateEmailEntity, result.right));
        }
        return result;
      }),
    );
  }

  static toPublicEntity(source: PrivateEmailEntity): EmailEntity {
    return {
      id: source.public_id,
      ...omit('public_id', source),
    };
  }
}
