import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { isUndefined } from 'lodash/fp';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import {
  Email,
  PrivateAdminUser,
  NanoId,
  UUIDv4,
  ParsingError,
  UnexpectedError,
  toLeftObs,
  toRightObs,
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

  @Column('text', { nullable: true })
  loginCode: string;

  @Column('timestamp', {
    nullable: true,
  })
  loginCodeExpiration: Date;

  @Column('timestamp', { nullable: true })
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
    public repo: Repository<AdminUserDBModel>,
  ) {}

  saveUser(
    updatedUser: PrivateAdminUser,
  ): Observable<e.Either<UnexpectedError, undefined>> {
    return from(this.repo.save(updatedUser)).pipe(
      switchMap(() => {
        return toRightObs(undefined);
      }),
      catchError((err) => {
        return toLeftObs(new UnexpectedError('Failed to save the user', err));
      }),
    );
  }

  findUser(
    criteria: FindOneMatcher,
  ): Observable<
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateAdminUser>>
  > {
    return from(this.repo.findOne({ where: criteria })).pipe(
      switchMap((res) => {
        if (isUndefined(res)) {
          return of(e.right(o.none));
        }

        return PrivateAdminUser.toPrivateEntity(res).pipe(
          map((res) => {
            if (e.isRight(res)) {
              return e.right(o.some(res.right));
            }
            return res;
          }),
        );
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Failed to find the user', err)),
      ),
    );
  }
}
