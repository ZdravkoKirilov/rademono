import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as e from 'fp-ts/lib/Either';

import { InitialOrganization, UUIDv4, breakTest } from '@end/global';

import {
  OrganizationDBModel,
  OrganizationRepository,
} from './organization.repository';

const createTestingModule = async (
  repoMock: Partial<Repository<OrganizationDBModel>> = {},
) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      OrganizationRepository,
      {
        provide: getRepositoryToken(OrganizationDBModel),
        useValue: repoMock,
      },
    ],
  }).compile();

  const service = module.get<OrganizationRepository>(OrganizationRepository);

  return { service };
};

describe(OrganizationRepository.name, () => {
  describe(OrganizationRepository.prototype.createOrganization.name, () => {
    it('succeeds with enough data', async (done) => {
      const { service } = await createTestingModule({
        save: () => Promise.resolve([]),
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
      } as InitialOrganization;

      service.createOrganization(data).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });
  });
});
