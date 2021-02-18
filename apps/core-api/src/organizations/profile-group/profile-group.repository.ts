import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { switchMap, catchError } from 'rxjs/operators';
import { from } from 'rxjs';

import {
  UUIDv4,
  PrivateProfileGroup,
  toLeftObs,
  UnexpectedError,
  toRightObs,
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

type FindOneMatcher = { public_id: UUIDv4 };

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
}
