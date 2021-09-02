import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { TokenService } from '@games-admin/shared';

@Injectable({ providedIn: 'root' })
export class WithAuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate() {
    return !!this.tokenService.getToken();
  }
}
