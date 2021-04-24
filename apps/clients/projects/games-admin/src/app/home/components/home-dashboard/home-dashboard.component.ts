import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { UsersService } from '@games-admin/users';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.scss'],
  host: { class: 'full-container centered-container' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeDashboardComponent {
  constructor(private userService: UsersService) {}

  handleLogout() {
    this.userService.logout();
  }
}
