import { IsEmail, IsUUID } from 'class-validator';

import { Email, Tagged, UUIDv4 } from '../../types';

type SuperUserId = Tagged<'SuperUserId', UUIDv4>;

export class SuperUser {
  @IsUUID()
  id: SuperUserId;

  @IsEmail()
  email: Email;
}
