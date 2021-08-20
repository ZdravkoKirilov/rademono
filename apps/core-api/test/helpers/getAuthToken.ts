import jwt from 'jsonwebtoken';
import { INestApplication } from '@nestjs/common';

import {
  UserId,
  breakTest,
  Email,
  JWT,
  User,
  UUIDv4,
  isLeft,
} from '@end/global';

import { AdminUserRepository } from '../../src/users/admin-users/admin-users.repository';

export const createTestUser = async (
  module: INestApplication,
  email: string,
  deleteAll = true,
) => {
  const repository = module.get(AdminUserRepository);

  if (deleteAll) {
    await repository.deleteAll();
  }

  const userId = UUIDv4.generate<UserId>();

  const mbEntity = await User.createAdminUser(
    {
      email: Email.generate(email),
    },
    () => userId,
  ).toPromise();

  if (!mbEntity || isLeft(mbEntity)) {
    return breakTest();
  }

  await repository.saveUser(mbEntity.right).toPromise();

  const mbToken = await User.generateToken(
    mbEntity.right,
    () => jwt.sign({ email: mbEntity.right.email }, 'secret') as JWT,
  ).toPromise();

  if (!mbToken || isLeft(mbToken)) {
    return breakTest();
  }

  const token = mbToken.right.token;

  return { token, userId };
};
