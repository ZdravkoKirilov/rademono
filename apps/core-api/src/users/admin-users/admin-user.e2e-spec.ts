import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../../app.module';

describe('AdminUserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
});
