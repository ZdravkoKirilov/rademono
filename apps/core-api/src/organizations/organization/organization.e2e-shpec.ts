import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Connection } from 'typeorm';

import { AppModule } from '../../app.module';
import { createTestUser } from '@app/test';
import { AdminUserRepository } from '../../users/admin-users/admin-users.repository';

describe('Organization endpoints (e2e)', () => {
  let app: INestApplication;
  let userRepository: AdminUserRepository;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    connection = app.get(Connection);
    await connection.synchronize(true);
    await app.init();
    userRepository = moduleFixture.get(AdminUserRepository);
  });

  afterAll(async () => {
    await app.close();
    await connection.close();
  });

  describe('/organization (POST)', () => {
    it('passes with correct data', async (done) => {
      const { token } = await createTestUser(userRepository, 'email@email.com');

      const { body } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(200);

      expect(body).toEqual({});

      done();
    });
  });
});
