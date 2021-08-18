import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { filter, map } from '@end/global';
import { AppRouterService } from '@games-admin/shared';
import { UsersService } from '@games-admin/users/services/users.service';

@Injectable({ providedIn: 'root' })
export class WithAuthGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private router: AppRouterService,
  ) {}

  canActivate() {
    return this.userService.getOrFetchUser().pipe(
      filter((res) => {
        return res.status === 'loaded';
      }),
      map((res) => {
        if (res.status === 'loaded' && res.data === null) {
          this.router.goToLogin();
          return false;
        }
        return true;
      }),
    );
  }
}
