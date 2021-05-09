import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  CreateOrganizationDto,
  mapEither,
  ParsingError,
  Organization,
  CreateOrganizationResponse,
} from '@end/global';
import { OrganizationService } from '@games-admin/organizations/services/organization.service';
import { QueryResponse, useQuery } from '@games-admin/shared';
import { RequestError } from '@libs/ui';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss'],
})
export class CreateOrganizationComponent implements AfterViewInit {
  draft?: CreateOrganizationDto;
  error?: ParsingError;

  constructor(private orgService: OrganizationService) {}

  createQuery$: Observable<
    QueryResponse<CreateOrganizationResponse, RequestError>
  >;

  @ViewChild('createForm', { static: true }) form: NgForm;

  ngAfterViewInit() {
    this.form.valueChanges?.subscribe((data) => {
      Organization.create(data)
        .pipe(
          mapEither(
            (err) => {
              // TODO map errors to FE-friendly format
              this.draft = undefined;
              this.error = err;
            },
            (org) => {
              this.error = undefined;
              this.draft = org;
            },
          ),
        )
        .subscribe();
    });
  }

  submit(event: Event) {
    event.preventDefault();
    const data = this.draft;

    if (data) {
      this.createQuery$ = useQuery(() =>
        this.orgService.createOrganization(data),
      );
    }
  }
}
