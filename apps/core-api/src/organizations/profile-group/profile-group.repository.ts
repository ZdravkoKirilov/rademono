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
  PrivateProfileGroup,
  toLeftObs,
  UnexpectedError,
  toRightObs,
  ParsingError,
} from '@end/global';

@Entity()
export class ProfileGroupDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  public_id: string;

  @Column('uuid')
  organization: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string;
}

type FindOneMatcher =
  | { public_id: UUIDv4 }
  | { name: string; organization: string };

export class ProfileGroupRepository {
  constructor(
    @InjectRepository(ProfileGroupDBModel)
    public repo: Repository<ProfileGroupDBModel>,
  ) {}

  saveProfileGroup(profileGroup: PrivateProfileGroup) {
    return from(this.repo.save(profileGroup)).pipe(
      switchMap(() => {
        return toRightObs(undefined);
      }),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to save the profile group', err),
        );
      }),
    );
  }

  getProfileGroup(
    matcher: FindOneMatcher,
  ): Observable<
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateProfileGroup>>
  > {
    return from(this.repo.find({ where: matcher })).pipe(
      switchMap((res) => {
        if (isUndefined(res)) {
          return toRightObs(o.none);
        }

        return PrivateProfileGroup.toPrivateEntity(res).pipe(
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
          new UnexpectedError('Failed to find the profile group', err),
        );
      }),
    );
  }
}
