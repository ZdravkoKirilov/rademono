import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { buildApiUrls, OrganizationId, UUIDv4 } from '@end/global';

import { AppModule } from '../../app.module';
import { createTestUser, cleanRepositories } from '@app/test';
import { DATABASE_CONNECTION, DBConnection } from '@app/database';
import { CollectionRepository } from './collection.repository';
import { CollectionController } from './collection.controller';
import { OrganizationRepository } from '../organization/organization.repository';

describe(CollectionController.name, () => {
  let app: INestApplication;
  let connection: DBConnection;

  const repos = [CollectionRepository, OrganizationRepository];

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

  describe(CollectionController.prototype.create, () => {
    it('passes with correct data', async (done) => {
      const { token } = await createTestUser(app, 'email11@email.com');

      const { body: createdOrganization } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(201);

      const url = buildApiUrls.collections(createdOrganization.id);

      const { body: createdCollection } = await request(app.getHttpServer())
        .post(url)
        .set('Authorization', token)
        .send({ name: 'Monstrous collection' })
        .expect(201);

      expect(createdCollection.name).toEqual('Monstrous collection');
      done();
    });

    it('requires authentication', async (done) => {
      const { body } = await request(app.getHttpServer())
        .post(buildApiUrls.collections('fakeId' as any))
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

      const orgId = UUIDv4.generate<OrganizationId>();

      const { body } = await request(app.getHttpServer())
        .post(buildApiUrls.collections(orgId))
        .set('Authorization', token)
        .send({})
        .expect(400);

      expect(body).toEqual({
        errors: [
          {
            constraints: {
              isNotEmpty: 'name should not be empty',
              maxLength: 'name must be shorter than or equal to 100 characters',
              minLength: 'name must be longer than or equal to 2 characters',
            },
            property: 'name',
          },
        ],
        message: '',
        name: 'ParsingError',
      });
      done();
    });

    it('fails with invalid organizationId', async (done) => {
      const { token } = await createTestUser(app, 'email12@email.com');

      const { body } = await request(app.getHttpServer())
        .post(buildApiUrls.collections('fakeId' as any))
        .set('Authorization', token)
        .send({ name: 'Some collection' })
        .expect(400);

      expect(body).toEqual({
        errors: [],
        message: 'Valid organizationId is required',
        name: 'ParsingError',
      });
      done();
    });
  });

  describe(CollectionController.prototype.getAll, () => {
    it('returns all collections', async (done) => {
      const { token } = await createTestUser(app, 'email1@email.com', false);

      const { body: createdOrganization1 } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(201);

      const { body: createdOrganization2 } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc 2' })
        .expect(201);

      const url1 = buildApiUrls.collections(createdOrganization1.id);
      const url2 = buildApiUrls.collections(createdOrganization2.id);

      await request(app.getHttpServer())
        .post(url1)
        .set('Authorization', token)
        .send({ name: 'Monstrous collection 1' })
        .expect(201);

      await request(app.getHttpServer())
        .post(url1)
        .set('Authorization', token)
        .send({ name: 'Monstrous collection 2' })
        .expect(201);

      await request(app.getHttpServer())
        .post(url2)
        .set('Authorization', token)
        .send({ name: 'Monstrous collection 3' })
        .expect(201);

      const { body: body1 } = await request(app.getHttpServer())
        .get(url1)
        .set('Authorization', token)
        .expect(200);

      const { body: body2 } = await request(app.getHttpServer())
        .get(url2)
        .set('Authorization', token)
        .expect(200);

      expect(body1).toHaveLength(2);
      expect(body2).toHaveLength(1);

      done();
    });

    it('fails with invalid organizationId', async (done) => {
      const { token } = await createTestUser(app, 'email12@email.com');

      const { body } = await request(app.getHttpServer())
        .get(buildApiUrls.collections('fakeId' as any))
        .set('Authorization', token)
        .expect(400);

      expect(body).toEqual({
        errors: [],
        message: 'Valid organizationId is required',
        name: 'ParsingError',
      });
      done();
    });
  });
});
