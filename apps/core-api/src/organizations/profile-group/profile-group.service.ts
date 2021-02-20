import { Inject, Injectable } from '@nestjs/common';
import { catchError, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { Observable } from 'rxjs';

import {
  DomainError,
  ParsingError,
  PrivateProfileGroup,
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
    e.Either<UnexpectedError | ParsingError | DomainError, PrivateProfileGroup>
  > {
    return PrivateProfileGroup.createFromUnknown(payload, this.createId).pipe(
      switchMap((mbGroup) => {
        if (e.isLeft(mbGroup)) {
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
                e.Either<
                  DomainError | ParsingError | UnexpectedError,
                  undefined
                >
              > => {
                if (e.isLeft(retrieved)) {
                  return toLeftObs(retrieved.left);
                }

                if (o.isSome(retrieved.right)) {
                  return toLeftObs(
                    new DomainError(
                      'Profile group with that name already exists.',
                    ),
                  );
                }

                return this.repo.saveProfileGroup(mbGroup.right);
              },
            ),
            switchMap((saveResult) => {
              if (e.isLeft(saveResult)) {
                return toLeftObs(saveResult.left);
              }
              return toRightObs(mbGroup.right);
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
