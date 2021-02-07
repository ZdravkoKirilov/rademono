import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UUIDv4, Organization } from '@end/global';

@Entity()
export class OrganizationDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  public_id: string;
}

type FindOneMatcher = { public_id: UUIDv4 };

export class OrganizationRepository {
  constructor(
    @InjectRepository(OrganizationDBModel)
    public repo: Repository<OrganizationDBModel>,
  ) {}

  saveOrganization(updatedOrganization: Organization) {}
}
