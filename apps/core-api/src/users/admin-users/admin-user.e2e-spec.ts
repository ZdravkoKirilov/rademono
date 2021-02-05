import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { Connection } from 'typeorm';

import { AdminUserParser, Email, JWT } from '@end/global';

import { AppModule } from '../../app.module';
import { AdminUserRepository } from './admin-users.repository';

describe('AdminUserController (e2e)', () => {
  let app: INestApplication;
  let repository: AdminUserRepository;

  const throwError = () => {
    throw new Error('This shouldn`t be reached');
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    const connection = app.get(Connection);
    await connection.synchronize(true);
    await app.init();
    repository = moduleFixture.get(AdminUserRepository);
  });

  describe('/admin-users/request-login-code (POST)', () => {
    it('succeeds with correct data', async (done) => {
      const { body } = await request(app.getHttpServer())
        .post('/admin-users/request-login-code')
        .expect(204)
        .send({ email: 'email@email.com' });

      expect(body).toEqual({});
      done();
    });

    it('fails with invalid email', async (done) => {
      const { body } = await request(app.getHttpServer())
        .post('/admin-users/request-login-code')
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

  describe('/admin-users/token (POST)', () => {
    it('returns a token given a valid login code', async (done) => {
      await request(app.getHttpServer())
        .post('/admin-users/request-login-code')
        .expect(204)
        .send({ email: 'email2@email.com' });

      const mbUser = await repository
        .findUser({
          email: Email.generate('email2@email.com'),
        })
        .toPromise();

      if (e.isLeft(mbUser)) {
        return throwError();
      }

      if (e.isRight(mbUser)) {
        if (o.isNone(mbUser.right)) {
          return throwError();
        }

        const loginCode = mbUser.right.value.loginCode;

        const { body } = await request(app.getHttpServer())
          .post('/admin-users/token')
          .expect(201)
          .send({ code: loginCode });

        const isTokenValid = await AdminUserParser.verifyToken(
          body.token,
          mbUser.right.value,
        ).toPromise();

        expect(isTokenValid).toBe(true);
        done();
      }
    });

    it('returns an error when the token is invalid', async (done) => {
      const loginCode = 'invalid';

      const { body } = await request(app.getHttpServer())
        .post('/admin-users/token')
        .expect(400)
        .send({ code: loginCode });

      expect(body.name).toEqual('ParsingError');
      done();
    });
  });
});
