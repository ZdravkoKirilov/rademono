import { Test, TestingModule } from '@nestjs/testing';

import {
  Email,
  UUIDv4,
  UserTypes,
  toRightObs,
  ParsingError,
  UnexpectedError,
  toLeftObs,
  isLeft,
  isRight,
  right,
  none,
} from '@end/global';

import { AdminUserRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';
import { EmailService } from '@app/emails';

const throwError = () => {
  throw new Error('This shouldn`t be reached');
};

describe(AdminUsersService.name, () => {
  let service: AdminUsersService;

  describe(AdminUsersService.prototype.requestLoginCode.name, () => {
    it('passes with correct data', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          {
            provide: AdminUserRepository,
            useValue: {
              findUser: () =>
                toRightObs({
                  public_id: UUIDv4.generate(),
                  email: Email.generate('email@email.com'),
                  type: UserTypes.standard,
                }),
              saveUser: () => toRightObs(undefined),
            } as Partial<AdminUserRepository>,
          },
          {
            provide: EmailService,
            useValue: {
              createLoginCodeEmail: () => toRightObs(undefined),
            },
          },
        ],
      }).compile();

      service = module.get<AdminUsersService>(AdminUsersService);
      const payload = { email: 'email@email.com' };

      service.requestLoginCode(payload).subscribe((dto) => {
        if (isLeft(dto)) {
          return throwError();
        }
        expect(dto).toEqual(right(undefined));
        done();
      });
    });

    it('fails with invalid email', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          {
            provide: AdminUserRepository,
            useValue: {},
          },
          {
            provide: EmailService,
            useValue: {},
          },
        ],
      }).compile();

      service = module.get<AdminUsersService>(AdminUsersService);
      const payload = { email: 'email' };

      service.requestLoginCode(payload).subscribe((mbDto) => {
        if (isRight(mbDto)) {
          return throwError();
        }

        expect(mbDto.left).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails with nullish payload', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          {
            provide: AdminUserRepository,
            useValue: {},
          },
          {
            provide: EmailService,
            useValue: {},
          },
        ],
      }).compile();

      service = module.get<AdminUsersService>(AdminUsersService);

      service.requestLoginCode(undefined).subscribe((mbDto) => {
        if (isRight(mbDto)) {
          return throwError();
        }

        expect(mbDto.left).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails when repo.findUser fails', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          {
            provide: AdminUserRepository,
            useValue: {
              findUser: () => {
                throw new Error('Whoops');
              },
            },
          },
          {
            provide: EmailService,
            useValue: {},
          },
        ],
      }).compile();

      service = module.get<AdminUsersService>(AdminUsersService);
      const payload = { email: 'email@email.com' };

      service.requestLoginCode(payload).subscribe((mbDto) => {
        if (isRight(mbDto)) {
          return throwError();
        }

        expect(mbDto.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('fails when repo.saveUser fails', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          {
            provide: AdminUserRepository,
            useValue: {
              findUser: () => toRightObs(none),
              saveUser: () => toLeftObs(new UnexpectedError()),
            } as Partial<AdminUserRepository>,
          },
          {
            provide: EmailService,
            useValue: {},
          },
        ],
      }).compile();

      service = module.get<AdminUsersService>(AdminUsersService);
      const payload = { email: 'email@email.com' };

      service.requestLoginCode(payload).subscribe((mbDto) => {
        if (isRight(mbDto)) {
          return throwError();
        }

        expect(mbDto.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('fails when email saving fails', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          {
            provide: AdminUserRepository,
            useValue: {
              findUser: () =>
                toRightObs({
                  public_id: UUIDv4.generate(),
                  email: Email.generate('email@email.com'),
                  type: UserTypes.standard,
                }),
              saveUser: () => toRightObs(undefined),
            } as Partial<AdminUserRepository>,
          },
          {
            provide: EmailService,
            useValue: {
              createLoginCodeEmail: () => toLeftObs(undefined),
            },
          },
        ],
      }).compile();

      service = module.get<AdminUsersService>(AdminUsersService);
      const payload = { email: 'email@email.com' };

      service.requestLoginCode(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });
});
