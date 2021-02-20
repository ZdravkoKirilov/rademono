import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { switchMap, catchError, map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { isUndefined } from 'lodash/fp';

import {
  UUIDv4,
  PrivateAdminProfile,
  toLeftObs,
  UnexpectedError,
  toRightObs,
  ParsingError,
} from '@end/global';

@Entity()
export class AdminProfileDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  public_id: string;

  @Column('uuid')
  user: string;

  @Column('uuid')
  group: string;

  @Column('text')
  name: string;
}

type FindOneMatcher = { public_id: UUIDv4 } | { user: string; group: string };

export class AdminProfileRepository {
  constructor(
    @InjectRepository(AdminProfileDBModel)
    public repo: Repository<AdminProfileDBModel>,
  ) {}

  saveProfile(
    adminProfile: PrivateAdminProfile,
  ): Observable<e.Either<UnexpectedError, undefined>> {
    return from(this.repo.save(adminProfile)).pipe(
      switchMap(() => {
        return toRightObs(undefined);
      }),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to save the admin profile', err),
        );
      }),
    );
  }

  getProfile(
    matcher: FindOneMatcher,
  ): Observable<
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateAdminProfile>>
  > {
    return from(this.repo.find({ where: matcher })).pipe(
      switchMap((res) => {
        if (isUndefined(res)) {
          return toRightObs(o.none);
        }

        return PrivateAdminProfile.toPrivateEntity(res).pipe(
          map((parsed) => {
            if (e.isRight(parsed)) {
              return e.right(o.some(parsed.right));
            }
            return parsed;
          }),
        );
      }),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to find the profile', err),
        );
      }),
    );
  }
}
