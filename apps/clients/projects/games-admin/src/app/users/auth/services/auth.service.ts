import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SendCodeDto } from '@end/global';

import { endpoints } from '@games-admin/shared/constants';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {}

  requestLoginCode(dto: SendCodeDto) {
    return this.http.post(endpoints.requestAuthCode, dto);
  }
}
