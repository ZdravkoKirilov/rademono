import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../../app.module';
import { createTestUser, cleanRepositories } from '@app/test';
import { AssetRepository } from './asset.repository';
import { AssetsController } from './assets.controller';
import { OrganizationRepository } from '../organization/organization.repository';

describe(AssetsController.name, () => {
  let app: INestApplication;
  const repos = [AssetRepository, OrganizationRepository];

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

  describe(AssetsController.prototype.uploadImage, () => {
    it('passes with correct data', async (done) => {
      const { token } = await createTestUser(app, 'email11@email.com');

      const { body: createdOrganization } = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', token)
        .send({ name: 'Monster inc' })
        .expect(201);

      const url = '/organization/' + createdOrganization.id + '/assets/images';

      const { body } = await request(app.getHttpServer())
        .post(url)
        .set('Authorization', token)
        .attach('file', 'test/file-uploading/bear.jpg')
        .field('name', 'Bear image');

      console.log(body);
      done();
    });
  });
});
