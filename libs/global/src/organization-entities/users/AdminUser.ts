import { IsEmail, IsUUID } from 'class-validator';

import { Email, Tagged, UUIDv4 } from '../../types';

type AdminUserId = Tagged<'AdminUserId', UUIDv4>;

abstract class CommonFields {
  @IsEmail()
  email: Email;
}

export class AdminUser extends CommonFields {
  @IsUUID()
  id: AdminUserId;
}

export class FullAdminUser extends AdminUser {
  activationCode: string;
  actionCodeExpiration: Date;
}
