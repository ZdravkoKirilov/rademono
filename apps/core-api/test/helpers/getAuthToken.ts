import * as e from 'fp-ts/lib/Either';

import {
  AdminUserId,
  breakTest,
  Email,
  PrivateAdminUser,
  UUIDv4,
} from '@end/global';

import { AdminUserRepository } from '../../src/users/admin-users/admin-users.repository';
import { INestApplication } from '@nestjs/common';

export const createTestUser = async (
  module: INestApplication,
  email: string,
  deleteAll = true,
) => {
  const repository = module.get(AdminUserRepository);

  if (deleteAll) {
    await repository.deleteAll();
  }

  const userId = UUIDv4.generate<AdminUserId>();

  const mbEntity = await PrivateAdminUser.create(
    {
      email: Email.generate(email),
    },
    () => userId,
  ).toPromise();

  if (e.isLeft(mbEntity)) {
    return breakTest();
  }

  await repository.saveUser(mbEntity.right).toPromise();

  const mbToken = await PrivateAdminUser.generateToken(
    mbEntity.right,
  ).toPromise();

  if (e.isLeft(mbToken)) {
    return breakTest();
  }

  const token = mbToken.right.token;

  return { token, userId };
};
