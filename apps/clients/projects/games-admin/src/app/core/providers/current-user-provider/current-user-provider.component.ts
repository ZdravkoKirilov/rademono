import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminUser } from '@end/global';
import { QueryResponse } from '@games-admin/shared';
import { UsersService } from '@games-admin/users';

@Component({
  selector: 'app-current-user-provider',
  templateUrl: './current-user-provider.component.html',
  styleUrls: ['./current-user-provider.component.scss'],
})
export class CurrentUserProviderComponent implements OnInit {
  constructor(private userService: UsersService) {}

  user$: Observable<QueryResponse<AdminUser | null, Error>>;

  ngOnInit(): void {
    
  }
}
