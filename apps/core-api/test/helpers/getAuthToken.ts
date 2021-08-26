import jwt from 'jsonwebtoken';
import { INestApplication } from '@nestjs/common';

import { UserId, breakTest, Email, User, UUIDv4, isLeft } from '@end/global';

import { UserRepository } from '../../src/users/users.repository';

export const createTestUser = async (
  module: INestApplication,
  email: string,
  deleteAll = true,
) => {
  const repository = module.get(UserRepository);

  if (deleteAll) {
    await repository.deleteAll();
  }

  const userId = UUIDv4.generate<UserId>();

  const mbEntity = await User.createUser(
    {
      email: Email.generate(email),
    },
    () => userId,
  ).toPromise();

  if (!mbEntity || isLeft(mbEntity)) {
    return breakTest();
  }

  await repository.saveUser(mbEntity.right).toPromise();

  const mbToken = await User.generateAccessToken(
    mbEntity.right,
    jwt.sign,
  ).toPromise();

  if (!mbToken || isLeft(mbToken)) {
    return breakTest();
  }

  const token = mbToken.right.token;

  return { token, userId };
};
