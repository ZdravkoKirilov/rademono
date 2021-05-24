import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Organization } from '@end/global';
import { Observable } from 'rxjs';

import { OrganizationService } from '@games-admin/organizations';
import { QueryResponse, useQuery } from '@games-admin/shared';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  host: { class: 'full-container padded-content' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent implements OnInit {
  constructor(private orgService: OrganizationService) {}

  organizations$: Observable<QueryResponse<Organization[]>>;

  ngOnInit(): void {
    this.organizations$ = useQuery(() =>
      this.orgService.getOrganizationsForUser(),
    );
  }
}
