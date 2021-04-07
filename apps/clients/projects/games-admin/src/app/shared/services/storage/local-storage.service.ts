import { Injectable } from '@angular/core';
import { JWT } from '@end/global';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  get(key: string) {
    return localStorage.getItem(key);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  saveToken(token: JWT) {
    localStorage.setItem('token', token);
  }

  getToken(): JWT | null {
    return localStorage.getItem('token') as JWT;
  }
}
