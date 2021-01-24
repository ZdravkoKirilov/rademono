import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { isUndefined } from 'lodash/fp';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import {
  AdminUserParser,
  Email,
  PrivateAdminUser,
  NanoId,
  UUIDv4,
  ParsingError,
  MalformedPayloadError,
} from '@end/global';

@Entity()
export class AdminUserDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  public_id: string;

  @Column('text')
  email: string;

  @Column('text')
  loginCode: string;

  @Column('date')
  loginCodeExpiration: Date;

  @Column('date')
  lastLogin: Date;

  @Column('text')
  type: string;
}

type UpdateOneMatcher = { public_id: UUIDv4 };

type FindOneMatcher =
  | { email: Email }
  | { loginCode: NanoId }
  | { public_id: UUIDv4 };

export class AdminUserRepository {
  constructor(
    @InjectRepository(AdminUserDBModel)
    private repo: Repository<AdminUserDBModel>,
  ) {}

  insertUser(newUser: PrivateAdminUser) {
    return from(this.repo.insert(newUser)).pipe(map(() => undefined));
  }

  updateUser(updatedUser: PrivateAdminUser, criteria: UpdateOneMatcher) {
    return from(this.repo.update(criteria, updatedUser)).pipe(
      map(() => undefined),
    );
  }

  saveUser(updatedUser: PrivateAdminUser) {
    return from(this.repo.save(updatedUser)).pipe(map(() => undefined));
  }

  findUser(
    criteria: FindOneMatcher,
  ): Observable<
    e.Either<ParsingError | MalformedPayloadError, o.Option<PrivateAdminUser>>
  > {
    return from(this.repo.findOne(criteria)).pipe(
      switchMap((res) => {
        if (isUndefined(res)) {
          return of(e.right(o.none));
        }
        return AdminUserParser.toPrivateEntity(res).pipe(
          map((res) => {
            if (e.isRight(res)) {
              return e.right(o.some(res.right));
            }
            return e.right(o.none);
          }),
        );
      }),
    );
  }
}
