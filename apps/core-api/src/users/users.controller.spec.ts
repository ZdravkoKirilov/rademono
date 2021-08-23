import { Test, TestingModule } from '@nestjs/testing';

import { toRightObs } from '@end/global';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from './auth.guard';

describe(UsersController.name, () => {
  let controller: UsersController;

  it('succeeds with correct data', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
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

    controller = module.get<UsersController>(UsersController);

    controller
      .requestLoginCode({ email: 'email@email.com' })
      .subscribe((res) => {
        expect(res).toBeUndefined();
        done();
      });
  });
});
