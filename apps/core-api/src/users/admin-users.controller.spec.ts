import { Test, TestingModule } from '@nestjs/testing';

import { toRightObs } from '@end/global';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AuthGuard } from './auth.guard';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;

  it('succeeds with correct data', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: AdminUsersService,
          useValue: {
            requestLoginCode: () => toRightObs(undefined),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: async () => true,
      })
      .compile();

    controller = module.get<AdminUsersController>(AdminUsersController);

    controller
      .requestLoginCode({ email: 'email@email.com' })
      .subscribe((res) => {
        expect(res).toBeUndefined();
        done();
      });
  });
});
