import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Collection } from '@end/global';

import { CollectionService } from '../../services';
import { AppRouterService, QueryResponse, useQuery } from '@games-admin/shared';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-collections-list',
  templateUrl: './collections-list.component.html',
  styleUrls: ['./collections-list.component.scss'],
})
export class CollectionsListComponent implements OnInit {
  constructor(
    private collService: CollectionService,
    private appRouter: AppRouterService,
  ) {}

  collections$: Observable<QueryResponse<Collection[]>>;

  ngOnInit() {
    const orgId = this.appRouter.getOrganizationId();

    if (!orgId) {
      // TODO: display error
      throw new Error();
    }

    this.collections$ = useQuery(() =>
      this.collService.getCollectionsForUser(orgId),
    );
  }
}
