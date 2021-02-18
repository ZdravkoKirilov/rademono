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
  PrivateAdminProfile,
  toLeftObs,
  UnexpectedError,
  toRightObs,
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

type FindOneMatcher = { public_id: UUIDv4 };

export class AdminProfileRepository {
  constructor(
    @InjectRepository(AdminProfileDBModel)
    public repo: Repository<AdminProfileDBModel>,
  ) {}

  saveProfile(adminProfile: PrivateAdminProfile) {
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
}
