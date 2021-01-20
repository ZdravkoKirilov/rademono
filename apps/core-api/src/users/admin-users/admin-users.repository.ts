import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { isUndefined } from 'lodash/fp';

import { AdminUserParser, Email, FullAdminUser } from '@end/global';

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

export class AdminUserRepository {
  constructor(
    @InjectRepository(AdminUserDBModel)
    private repo: Repository<AdminUserDBModel>,
  ) {}

  insertUser: (user: FullAdminUser) => {};

  updateUser: () => {};

  findUser(email: Email) {
    return from(this.repo.findOne({ email })).pipe(
      switchMap((res) => {
        if (isUndefined(res)) {
          return of(res);
        }
        return AdminUserParser.toFullEntity({
          ...res,
          id: res.public_id,
        });
      }),
    );
  }
}
