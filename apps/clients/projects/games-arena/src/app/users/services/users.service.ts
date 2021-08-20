import { Injectable } from '@angular/core';

import { JWT, NanoId, Observable, of } from '@end/global';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor() {}

  private token?: JWT;

  private requestAuthToken(code?: NanoId): Observable<JWT> {
    if (code) {
      // call endpoint that expects code
      return of('1234' as JWT);
    }
    // call endpoint that checks for a refresh token
    return of('1234' as JWT);
  }

  setToken(token: JWT) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  login() {}

  requestLoginCode() {}
}
