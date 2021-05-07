import { Injectable } from '@angular/core';
import { CreateOrganizationDto } from '@end/global';

import { BaseHttpService, endpoints } from '@games-admin/shared';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: BaseHttpService) {}

  createOrganization(dto: CreateOrganizationDto) {
    return this.http.post({
      url: endpoints.organization,
      data: dto,
    });
  }
}
