import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Entity()
export class AdminUserDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  public_id: string;

  @Column('string')
  email: string;

  @Column('text')
  activationCode: string;

  @Column('date')
  actionCodeExpiration: Date;

  @Column('boolean')
  verified: boolean;

  @Column('string')
  type: string;
}

export class AdminUserRepository {
  constructor(
    @InjectRepository(AdminUserDBModel)
    private repo: Repository<AdminUserDBModel>,
  ) {}
}
