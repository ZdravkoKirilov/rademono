import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  CreateOrganizationDto,
  mapEither,
  ParsingError,
  PrivateOrganization,
  UUIDv4,
} from '@end/global';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss'],
})
export class CreateOrganizationComponent implements AfterViewInit {
  draft: CreateOrganizationDto;
  error: ParsingError;

  @ViewChild('createForm', { static: true }) form: NgForm;

  ngAfterViewInit() {
    this.form.valueChanges?.subscribe((data) => {
      PrivateOrganization.create(data, UUIDv4.generate)
        .pipe(
          mapEither(
            (err) => {
              // TODO map errors to FE-friendly format
              this.error = err;
              console.log(err);
            },
            (org) => {
              console.log(org);
            },
          ),
        )
        .subscribe();
    });
  }
}
