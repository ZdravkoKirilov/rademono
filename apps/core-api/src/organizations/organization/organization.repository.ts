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
  PrivateOrganization,
  toLeftObs,
  UnexpectedError,
  toRightObs,
  InitialOrganization,
  ParsingError,
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

type FindOneMatcher = { public_id: UUIDv4 } | { name: string };

export class OrganizationRepository {
  constructor(
    @InjectRepository(OrganizationDBModel)
    private repo: Repository<OrganizationDBModel>,
  ) {}

  createOrganization(
    organization: InitialOrganization,
  ): Observable<e.Either<UnexpectedError, InitialOrganization>> {
    try {
      return from(this.repo.insert(organization)).pipe(
        switchMap(() => {
          return toRightObs(organization);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError('Failed to create the organization', err),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError('Failed to create the organization', err),
      );
    }
  }

  saveOrganization(
    updatedOrganization: PrivateOrganization,
  ): Observable<e.Either<UnexpectedError, PrivateOrganization>> {
    try {
      return from(this.repo.save(updatedOrganization)).pipe(
        switchMap(() => {
          return toRightObs(updatedOrganization);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError('Failed to save the organization', err),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError('Failed to save the organization', err),
      );
    }
  }

  organizationExists(
    matcher: FindOneMatcher,
  ): Observable<e.Either<UnexpectedError, boolean>> {
    try {
      return from(this.repo.count({ where: matcher })).pipe(
        switchMap((count) => {
          return toRightObs(count > 0);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError(
              'Failed to find whether the organization exists',
              err,
            ),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError(
          'Failed to find whether the organization exists',
          err,
        ),
      );
    }
  }

  getOrganization(
    matcher: FindOneMatcher,
  ): Observable<
    e.Either<UnexpectedError | ParsingError, o.Option<PrivateOrganization>>
  > {
    try {
      return from(this.repo.findOne({ where: matcher })).pipe(
        switchMap((res) => {
          if (isUndefined(res)) {
            return toRightObs(o.none);
          }

          return PrivateOrganization.toPrivateEntity(res).pipe(
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
            new UnexpectedError('Failed to find the organization', err),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError('Failed to find the organization', err),
      );
    }
  }
}
