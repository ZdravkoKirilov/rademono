import { Injectable } from '@angular/core';

import { JWT, NanoId } from '@end/global';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor() {}

  private token?: JWT;

  private requestAuthToken(code?: NanoId) {}

  setToken() {}

  getToken() {}

  login() {}

  requestLoginCode() {}
}
