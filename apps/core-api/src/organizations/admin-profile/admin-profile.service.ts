import { Inject, Injectable } from '@nestjs/common';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { Observable } from 'rxjs';

import {
  AdminProfile,
  DomainError,
  ParsingError,
  PrivateAdminProfile,
  toLeftObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { AdminProfileRepository } from './admin-profile.repository';
import { PUBLIC_ID_GENERATOR } from '@app/shared';
@Injectable()
export class AdminProfileService {
  constructor(
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
    private repo: AdminProfileRepository,
  ) {}

  create(
    payload: unknown,
  ): Observable<
    e.Either<UnexpectedError | ParsingError | DomainError, AdminProfile>
  > {
    return PrivateAdminProfile.create(payload, this.createId).pipe(
      switchMap((mbProfile) => {
        if (e.isLeft(mbProfile)) {
          return toLeftObs(mbProfile.left);
        }
        return this.repo
          .getProfile({
            user: mbProfile.right.user,
            group: mbProfile.right.group,
          })
          .pipe(
            map((res) => {
              return e.right({
                parsed: mbProfile.right,
                retrieved: res,
              });
            }),
          );
      }),
      switchMap((mbExisting) => {
        if (e.isLeft(mbExisting)) {
          return toLeftObs(mbExisting.left);
        }
        if (e.isLeft(mbExisting.right.retrieved)) {
          return toLeftObs(mbExisting.right.retrieved.left);
        }
        if (o.isSome(mbExisting.right.retrieved.right)) {
          return toLeftObs(
            new DomainError('Profile already exists in this group'),
          );
        }
        return this.repo.saveProfile(mbExisting.right.parsed).pipe(
          map((mbSaved) => {
            return e.isRight(mbSaved)
              ? e.right(
                  PrivateAdminProfile.toPublicEntity(mbExisting.right.parsed),
                )
              : mbSaved;
          }),
        );
      }),
      catchError((err) =>
        toLeftObs(
          new UnexpectedError(
            'Unexpected error while trying to create an admin profile',
            err,
          ),
        ),
      ),
    );
  }
}
