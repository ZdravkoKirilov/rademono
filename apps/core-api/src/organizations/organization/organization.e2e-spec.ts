import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../../app.module';
import { createTestUser, cleanRepositories } from '@app/test';
import { DATABASE_CONNECTION, DBConnection } from '@app/database';
import { OrganizationRepository } from './organization.repository';
import { ProfileGroupRepository } from '../profile-group/profile-group.repository';
import { AdminProfileRepository } from '../admin-profile/admin-profile.repository';
import { OrganizationController } from './organization.controller';

describe(OrganizationController.name, () => {
  let app: INestApplication;
  let connection: DBConnection;

  const repos = [
    OrganizationRepository,
    ProfileGroupRepository,
    AdminProfileRepository,
  ];

  beforeAll(async (done) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    connection = app.get(DATABASE_CONNECTION);

    await cleanRepositories(app, repos);

    await app.init();
    done();
  });

  afterAll(async (done) => {
    await app.close();
    await connection.client.close();
    done();
  });

  afterEach(async () => {
    await cleanRepositories(app, repos);
  });

  describe(OrganizationController.prototype.create, () => {
    it('passes with correct data', async (done) => {
      const { token } = await createTestUser(app, 'email11@email.com');

      const { body } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(201);

      expect(body).toMatchObject({
        name: 'Monster inc',
        admin_group: { name: 'Admins', profiles: [{ name: 'Admin' }] },
      });

      done();
    });

    it('requires authentication', async (done) => {
      const { body } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', 'whatever')
        .expect(401);

      expect(body).toEqual({
        message: 'Unauthorized to view this resource',
        name: 'Unauthorized',
      });

      done();
    });

    it('fails with invalid data', async (done) => {
      const { token } = await createTestUser(app, 'email12@email.com');

      const { body } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({})
        .expect(400);

      expect(body).toEqual({
        errors: [
          {
            constraints: {
              isNotEmpty: 'name should not be empty',
              maxLength: 'name must be shorter than or equal to 100 characters',
              minLength: 'name must be longer than or equal to 1 characters',
            },
            property: 'name',
          },
        ],
        message: '',
        name: 'ParsingError',
      });
      done();
    });

    it('fails when organization with that name exists', async (done) => {
      const { token } = await createTestUser(app, 'email13@email.com');

      await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(201);

      const { body } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(403);

      expect(body).toEqual({
        message: 'NameTaken',
        name: 'NameTaken',
      });

      done();
    });
  });

  describe(OrganizationController.prototype.getAllForUser, () => {
    it('returns all organizations for the user', async (done) => {
      const { token: token1 } = await createTestUser(
        app,
        'email1@email.com',
        false,
      );
      const { token: token2 } = await createTestUser(
        app,
        'email2@email.com',
        false,
      );

      await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token1)
        .send({ name: 'Org 1' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token2)
        .send({ name: 'Org 2' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token1)
        .send({ name: 'Org 3' })
        .expect(201);

      const { body: body1 } = await request(app.getHttpServer())
        .get('/organization')
        .set('Authorization', token1)
        .expect(200);

      const { body: body2 } = await request(app.getHttpServer())
        .get('/organization')
        .set('Authorization', token2)
        .expect(200);

      expect(body1).toHaveLength(2);
      expect(body2).toHaveLength(1);

      done();
    });
  });
});
