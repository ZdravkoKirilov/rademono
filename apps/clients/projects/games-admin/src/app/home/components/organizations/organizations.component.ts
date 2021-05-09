import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OrganizationService } from '@games-admin/organizations/services/organization.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  host: { class: 'full-container padded-content' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent implements OnInit {
  constructor(private orgService: OrganizationService) {}

  ngOnInit(): void {
    this.orgService;
  }
}
