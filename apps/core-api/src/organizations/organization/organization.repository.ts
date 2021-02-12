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
  PrivateOrganization,
  toLeftObs,
  UnexpectedError,
  toRightObs,
} from '@end/global';

@Entity()
export class OrganizationDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  public_id: string;

  @Column('uuid')
  admin_group?: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description?: string;
}

type FindOneMatcher = { public_id: UUIDv4 };

export class OrganizationRepository {
  constructor(
    @InjectRepository(OrganizationDBModel)
    public repo: Repository<OrganizationDBModel>,
  ) {}

  saveOrganization(updatedOrganization: PrivateOrganization) {
    return from(this.repo.save(updatedOrganization)).pipe(
      switchMap(() => {
        return toRightObs(undefined);
      }),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError('Failed to save the organization', err),
        );
      }),
    );
  }
}
