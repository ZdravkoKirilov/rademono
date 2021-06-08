import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { Collection, CreateCollectionDto, OrganizationId } from '@end/global';

import { BaseHttpService, endpoints } from '@games-admin/shared';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private http: BaseHttpService) {}

  collections$ = new BehaviorSubject<Collection[] | null>(null);

  createCollection(dto: CreateCollectionDto, organizationId: OrganizationId) {
    return this.http
      .post({
        url: endpoints.collection(organizationId),
        data: dto,
        responseShape: Collection,
      })
      .pipe(
        tap((newlyCreatedCollection) => {
          const currentValue = this.collections$.getValue() || [];
          this.collections$.next([...currentValue, newlyCreatedCollection]);
        }),
      );
  }

  getCollectionsForUser(organizationId: OrganizationId) {
    return this.collections$.pipe(
      switchMap((currentCollections) => {
        return currentCollections
          ? of(currentCollections)
          : this.http
              .getMany({
                url: endpoints.collection(organizationId),
                responseShape: Collection,
              })
              .pipe(
                tap((response) => {
                  this.collections$.next(response);
                }),
              );
      }),
    );
  }
}
