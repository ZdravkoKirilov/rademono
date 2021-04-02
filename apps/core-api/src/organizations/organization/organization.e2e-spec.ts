import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../../app.module';
import { createTestUser, cleanRepositories } from '@app/test';
import { OrganizationRepository } from './organization.repository';
import { ProfileGroupRepository } from '../profile-group/profile-group.repository';
import { AdminProfileRepository } from '../admin-profile/admin-profile.repository';

describe('Organization endpoints (e2e)', () => {
  let app: INestApplication;
  const repos = [
    OrganizationRepository,
    ProfileGroupRepository,
    AdminProfileRepository,
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    await cleanRepositories(app, repos);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await cleanRepositories(app, repos);
  });

  describe('/organization (POST)', () => {
    it('passes with correct data', async (done) => {
      const { token } = await createTestUser(app, 'email11@email.com');

      const { body } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(201);

      expect(body.group).toMatchObject({ name: 'Admins' });
      expect(body.profile).toMatchObject({ name: 'Admin' });
      expect(body.organization).toMatchObject({ name: 'Monster inc' });

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
        message: 'Organization with that name already exists',
        name: 'DomainError',
      });

      done();
    });
  });
});
