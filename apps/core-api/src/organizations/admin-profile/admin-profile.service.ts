import { Inject, Injectable } from '@nestjs/common';

import {
  AdminProfile,
  DomainError,
  Either,
  isLeft,
  ParsingError,
  PrivateAdminProfile,
  right,
  toLeftObs,
  UnexpectedError,
  UUIDv4,
  isSome,
  isRight,
  Observable,
  switchMap,
  map,
  catchError,
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
    Either<UnexpectedError | ParsingError | DomainError, AdminProfile>
  > {
    return PrivateAdminProfile.create(payload, this.createId).pipe(
      switchMap((mbProfile) => {
        if (isLeft(mbProfile)) {
          return toLeftObs(mbProfile.left);
        }
        return this.repo
          .getProfile({
            user: mbProfile.right.user,
            group: mbProfile.right.group,
          })
          .pipe(
            map((res) => {
              return right({
                parsed: mbProfile.right,
                retrieved: res,
              });
            }),
          );
      }),
      switchMap((mbExisting) => {
        if (isLeft(mbExisting)) {
          return toLeftObs(mbExisting.left);
        }
        if (isLeft(mbExisting.right.retrieved)) {
          return toLeftObs(mbExisting.right.retrieved.left);
        }
        if (isSome(mbExisting.right.retrieved.right)) {
          return toLeftObs(new DomainError('EntityExists'));
        }
        return this.repo.saveProfile(mbExisting.right.parsed).pipe(
          map((mbSaved) => {
            return isRight(mbSaved)
              ? right(
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
