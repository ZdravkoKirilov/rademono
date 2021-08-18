import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import {
  Collection,
  CreateCollectionDto,
  mapEither,
  ParsingError,
  Observable,
} from '@end/global';
import { RequestError } from '@libs/ui';
import { AppRouterService, QueryResponse, useQuery } from '@games-admin/shared';

import { CollectionService } from '../../services';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss'],
})
export class CreateCollectionComponent {
  constructor(
    private collService: CollectionService,
    private appRouter: AppRouterService,
  ) {}

  draft?: CreateCollectionDto;
  error?: ParsingError;
  createQuery$: Observable<QueryResponse<Collection, RequestError>>;

  @ViewChild('createForm', { static: true }) form: NgForm;

  ngAfterViewInit() {
    this.form.valueChanges?.subscribe((data) => {
      Collection.create(data)
        .pipe(
          mapEither(
            (err) => {
              // TODO map errors to FE-friendly format
              this.draft = undefined;
              this.error = err;
            },
            (validatedDto) => {
              this.error = undefined;
              this.draft = validatedDto;
            },
          ),
        )
        .subscribe();
    });
  }

  submit(event: Event) {
    event.preventDefault();
    const data = this.draft;
    const organizationId = this.appRouter.getOrganizationId();

    if (!organizationId) {
      // TODO: display error
      throw new Error();
    }

    if (data) {
      this.createQuery$ = useQuery(() =>
        this.collService.createCollection(data, organizationId),
      );
    }
  }
}
