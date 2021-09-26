import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { Connection, DATABASE_CONNECTION } from '@app/database';
import {
  User,
  UserTypes,
  Email,
  UUIDv4,
  UserId,
  isLeft,
  isRight,
  isNone,
  ApiUrls,
} from '@end/global';

import { AppModule } from '../app.module';
import { UserRepository } from './users.repository';
import { USERS_COLLECTION } from './constants';
import { UsersController } from './users.controller';

describe(UsersController.name + ' (e2e)', () => {
  let app: INestApplication;
  let repository: UserRepository;
  let connection: Connection;

  const throwError = () => {
    throw new Error('This shouldn`t be reached');
  };

  afterEach(async () => {
    await connection.collection(USERS_COLLECTION).deleteMany({});
  });

  beforeAll(async (done) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    connection = app.get(DATABASE_CONNECTION);
    await connection.collection(USERS_COLLECTION).deleteMany({});
    await app.init();
    repository = moduleFixture.get(UserRepository);
    done();
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });

  describe(ApiUrls.getCurrentUser + ' (GET)', () => {
    it('returns the current user given a valid auth token', async (done) => {
      const userId = UUIDv4.generate<UserId>();

      const mbEntity = await User.createUser(
        {
          email: Email.generate('email3@email.com'),
        },
        () => userId,
      ).toPromise();

      if (!mbEntity || isLeft(mbEntity)) {
        return throwError();
      }

      await repository.saveUser(mbEntity.right).toPromise();

      const mbToken = await User.generateAccessToken(
        mbEntity.right,
        jwt.sign,
      ).toPromise();

      if (!mbToken || isLeft(mbToken)) {
        return throwError();
      }

      const token = mbToken.right.token;

      const { body } = await request(app.getHttpServer())
        .get(ApiUrls.getCurrentUser)
        .set('Authorization', token)
        .expect(200);

      expect(body).toEqual({
        id: userId,
        type: UserTypes.standard,
        email: 'email3@email.com',
      });

      done();
    });

    it('returns Forbidden error when the token is invalid', async (done) => {
      const { body } = await request(app.getHttpServer())
        .get(ApiUrls.getCurrentUser)
        .set('Authorization', 'whatever')
        .expect(401);

      expect(body).toEqual({
        message: 'Unauthorized to view this resource',
        name: 'Unauthorized',
      });

      done();
    });
  });

  describe(ApiUrls.getLoginCode + ' (POST)', () => {
    it('succeeds with correct data', async (done) => {
      const { body } = await request(app.getHttpServer())
        .post(ApiUrls.getLoginCode)
        .expect(204)
        .send({ email: 'email@email.com' });

      expect(body).toEqual({});
      done();
    });

    it('fails with invalid email', async (done) => {
      const { body } = await request(app.getHttpServer())
        .post(ApiUrls.getLoginCode)
        .send({ email: 'email' })
        .expect(400);

      expect(body).toEqual({
        errors: [
          {
            constraints: {
              isEmail: 'email must be an email',
            },
            property: 'email',
          },
        ],
        message: '',
        name: 'ParsingError',
      });
      done();
    });
  });

  describe(ApiUrls.getAuthToken + ' (POST)', () => {
    it('returns a token given a valid login code', async (done) => {
      await request(app.getHttpServer())
        .post(ApiUrls.getLoginCode)
        .expect(204)
        .send({ email: 'email2@email.com' });

      const mbUser = await repository
        .findUser({
          email: Email.generate('email2@email.com'),
        })
        .toPromise();

      if (!mbUser || isLeft(mbUser)) {
        return throwError();
      }

      if (isRight(mbUser)) {
        if (isNone(mbUser.right)) {
          return throwError();
        }

        const loginCode = mbUser.right.value.loginCode;

        const { body } = await request(app.getHttpServer())
          .post(ApiUrls.getAuthToken)
          .expect(201)
          .send({ code: loginCode });

        const decoded = await User.decodeAccessToken(
          body.token,
          jwt.verify,
        ).toPromise();

        expect(decoded).toEqual({
          _tag: 'Right',
          right: { id: mbUser.right.value.public_id },
        });
        done();
      }
    });

    it('returns an error when the login code is invalid', async (done) => {
      const loginCode = 'invalid';

      const { body } = await request(app.getHttpServer())
        .post(ApiUrls.getAuthToken)
        .expect(400)
        .send({ code: loginCode });

      expect(body.name).toEqual('ParsingError');
      done();
    });
  });
});
