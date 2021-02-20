import { Injectable } from '@nestjs/common';
import { map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { Observable } from 'rxjs';

import {
  ParsingError,
  PrivateProfileGroup,
  toLeftObs,
  UnexpectedError,
} from '@end/global';
import { ProfileGroupRepository } from './profile-group.repository';

@Injectable()
export class ProfileGroupService {
  constructor(private repo: ProfileGroupRepository) {}
  create(
    payload: unknown,
  ): Observable<e.Either<UnexpectedError | ParsingError, PrivateProfileGroup>> {
    return PrivateProfileGroup.createFromUnknown(payload).pipe(
      switchMap((mbGroup) => {
        if (e.isLeft(mbGroup)) {
          return toLeftObs(mbGroup.left);
        }
        return this.repo
          .saveProfileGroup(mbGroup.right)
          .pipe(map(() => e.right(mbGroup.right)));
      }),
    );
  }
}
