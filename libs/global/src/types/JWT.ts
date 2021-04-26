import { IsEmail } from 'class-validator';
import { Expose } from 'class-transformer';

import { Email } from './Email';
import { Tagged } from './Tagged';

export type JWT = Tagged<'__JWT__', string>;

export class DecodedJWT {
  @Expose()
  @IsEmail()
  email: Email;
}
