import { Injectable } from '@angular/core';
import { AccessToken } from '@end/global';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private token?: AccessToken;

  saveToken(token: AccessToken) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  removeToken() {
    this.token = undefined;
  }
}
