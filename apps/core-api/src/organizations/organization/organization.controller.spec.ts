import { PrivateAdminUser, toRightObs, UUIDv4 } from '@end/global';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from '../../users/admin-users';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

describe('OrganizationController', () => {
  let controller: OrganizationController;

  it('passes when OrganizationService.create passes', async (done) => {
    const user = {
      public_id: UUIDv4.generate(),
    } as PrivateAdminUser;

    const data = {
      name: 'Monster inc',
    };

    const result = { name: 'Organization' };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: {
            create: () => toRightObs(result),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: async () => true,
      })
      .compile();

    controller = module.get<OrganizationController>(OrganizationController);

    controller.create(data, user).subscribe((res) => {
      expect(res).toEqual(result);
      done();
    });
  });
});
