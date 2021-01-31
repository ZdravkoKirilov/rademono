import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { of } from 'rxjs';

import {
  Email,
  UUIDv4,
  AdminUserTypes,
  toRightObs,
  ParsingError,
  MalformedPayloadError,
  UnexpectedError,
  toLeftObs,
} from '@end/global';

import { AdminUserRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';

const throwError = () => {
  throw new Error('This shouldn`t be reached');
};

describe('AdminUsersService', () => {
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
                  type: AdminUserTypes.standard,
                }),
              saveUser: () => toRightObs(undefined),
            } as Partial<AdminUserRepository>,
          },
        ],
      }).compile();

      service = module.get<AdminUsersService>(AdminUsersService);
      const payload = { email: 'email@email.com' };

      service.requestLoginCode(payload).subscribe((dto) => {
        if (e.isLeft(dto)) {
          return throwError();
        }
        expect(dto).toEqual(e.right(undefined));
        done();
      });
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
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    const payload = { email: 'email' };

    service.requestLoginCode(payload).subscribe((mbDto) => {
      if (e.isRight(mbDto)) {
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
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);

    service.requestLoginCode(undefined).subscribe((mbDto) => {
      if (e.isRight(mbDto)) {
        return throwError();
      }

      expect(mbDto.left).toBeInstanceOf(MalformedPayloadError);
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
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    const payload = { email: 'email@email.com' };

    service.requestLoginCode(payload).subscribe((mbDto) => {
      if (e.isRight(mbDto)) {
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
            findUser: () => toRightObs(o.none),
            saveUser: () => toLeftObs(new UnexpectedError()),
          } as Partial<AdminUserRepository>,
        },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    const payload = { email: 'email@email.com' };

    service.requestLoginCode(payload).subscribe((mbDto) => {
      if (e.isRight(mbDto)) {
        return throwError();
      }

      expect(mbDto.left).toBeInstanceOf(UnexpectedError);
      done();
    });
  });
});
