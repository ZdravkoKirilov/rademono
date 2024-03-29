import { Component, OnInit } from '@angular/core';

import { PublicUser, Observable } from '@end/global';
import { QueryResponse } from '@games-admin/shared';
import { UsersService } from '@games-admin/users';
import { RequestError } from '@libs/ui';

@Component({
  selector: 'app-current-user-provider',
  templateUrl: './current-user-provider.component.html',
  styleUrls: ['./current-user-provider.component.scss'],
})
export class CurrentUserProviderComponent implements OnInit {
  constructor(private userService: UsersService) {}

  user$: Observable<QueryResponse<PublicUser | null, RequestError>>;

  ngOnInit(): void {
    this.user$ = this.userService.getOrFetchUser();
  }
}
