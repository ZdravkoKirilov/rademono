import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from './../src/app.module';

describe('AdminUserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/admin-users/request-login-code (POST)', async (done) => {
    const response = await request(app.getHttpServer())
      .post('/admin-users/request-login-code')
      .send({ email: 'email@email.com' })
      .expect(204)
      .then((res) => res.body);

    expect(response).toEqual({});
    done();
  });
});
