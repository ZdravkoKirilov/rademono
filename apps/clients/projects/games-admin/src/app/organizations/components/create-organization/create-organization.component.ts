import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  CreateOrganizationDto,
  mapEither,
  ParsingError,
  Organization,
} from '@end/global';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss'],
})
export class CreateOrganizationComponent implements AfterViewInit {
  draft?: CreateOrganizationDto;
  error?: ParsingError;

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
    console.log(this.draft);
  }
}
