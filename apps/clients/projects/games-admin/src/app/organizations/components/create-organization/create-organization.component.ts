import { Component } from '@angular/core';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss'],
})
export class CreateOrganizationComponent {
  draft: {
    name?: string;
    description?: string;
  } = {};
}
