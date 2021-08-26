import { Inject, Injectable } from '@nestjs/common';

import {
  catchError,
  DomainError,
  Either,
  isLeft,
  isSome,
  Observable,
  ParsingError,
  PrivateProfileGroup,
  ProfileGroup,
  switchMap,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { ProfileGroupRepository } from './profile-group.repository';

@Injectable()
export class ProfileGroupService {
  constructor(
    private repo: ProfileGroupRepository,
    @Inject(PUBLIC_ID_GENERATOR) private createId: typeof UUIDv4.generate,
  ) {}
  create(
    payload: unknown,
  ): Observable<
    Either<UnexpectedError | ParsingError | DomainError, ProfileGroup>
  > {
    return PrivateProfileGroup.create(payload, this.createId).pipe(
      switchMap((mbGroup) => {
        if (isLeft(mbGroup)) {
          return toLeftObs(mbGroup.left);
        }

        return this.repo
          .getProfileGroup({
            name: mbGroup.right.name,
            organization: mbGroup.right.organization,
          })
          .pipe(
            switchMap(
              (
                retrieved,
              ): Observable<
                Either<
                  DomainError | ParsingError | UnexpectedError,
                  PrivateProfileGroup
                >
              > => {
                if (isLeft(retrieved)) {
                  return toLeftObs(retrieved.left);
                }

                if (isSome(retrieved.right)) {
                  return toLeftObs(new DomainError('NameTaken'));
                }

                return this.repo.saveProfileGroup(mbGroup.right);
              },
            ),
            switchMap((saveResult) => {
              if (isLeft(saveResult)) {
                return toLeftObs(saveResult.left);
              }
              return toRightObs(
                PrivateProfileGroup.toPublicEntity(mbGroup.right),
              );
            }),
          );
      }),
      catchError((err) =>
        toLeftObs(
          new UnexpectedError(
            'Unexpected error while trying to create an admin profile group',
            err,
          ),
        ),
      ),
    );
  }
}
