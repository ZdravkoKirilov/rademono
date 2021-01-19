import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsIn,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { Email, NanoId, Tagged, UUIDv4 } from '../../types';

type AdminUserId = Tagged<'AdminUserId', UUIDv4>;

abstract class CommonFields {
  @IsEmail()
  email: Email;
}

export enum AdminUserTypes {
  superuser = 'superuser',
  standard = 'standard',
}

export class AdminUser extends CommonFields {
  @IsUUID()
  id: AdminUserId;
}

export class FullAdminUser extends AdminUser {
  @IsOptional()
  @NanoId.IsNanoId()
  activationCode: NanoId;

  @IsOptional()
  @IsDate()
  actionCodeExpiration: Date;

  @IsBoolean()
  verified: boolean;

  @IsIn(Object.values(AdminUserTypes))
  type: AdminUserTypes;
}

export class SendCodeDto {
  @IsEmail()
  email: Email;
}

export class AdminUserSignInDto {
  @NanoId.IsNanoId()
  code: NanoId;
}
