import { Component, OnInit } from '@angular/core';

import { AppRouterService } from '@games-admin/shared';

@Component({
  selector: 'app-organization-dashboard',
  templateUrl: './organization-dashboard.component.html',
  styleUrls: ['./organization-dashboard.component.scss'],
})
export class OrganizationDashboardComponent implements OnInit {
  constructor(public appRouter: AppRouterService) {}

  ngOnInit(): void {}
}
