import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from '@end/global';

import { UsersService } from '@games-admin/users/services/users.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    firstValueFrom(this.usersService.logout().pipe());
  }
}
