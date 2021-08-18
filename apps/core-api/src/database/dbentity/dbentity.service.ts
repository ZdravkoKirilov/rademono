import { Inject, Injectable } from '@nestjs/common';
import { Db, FilterQuery } from 'mongodb';

import {
  Dictionary,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  right,
  Either,
  Observable,
  from,
  switchMap,
  catchError,
  map,
  of,
  throwError,
} from '@end/global';

import { DATABASE_COLLECTION, DATABASE_CONNECTION } from '../constants';

type UnspecifiedEntity = { public_id: string };

@Injectable()
export class DbentityService<T extends UnspecifiedEntity> {
  constructor(
    @Inject(DATABASE_CONNECTION) private connection: Db,
    @Inject(DATABASE_COLLECTION) private _collection: string,
  ) {
    if (!_collection) {
      throw new Error(
        'DATABASE_COLLECTION is missing. You must import DatabaseModule.forFeature() in the current module.',
      );
    }
  }

  get collection() {
    return this.connection.collection(this._collection);
  }

  insert(document: T): Observable<Either<UnexpectedError, T>> {
    try {
      return from(this.collection.insertOne(document)).pipe(
        switchMap((res: unknown) => {
          return toRightObs(res as T);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError(
              'Failed to insert a document in collection: ' + this._collection,
              err,
            ),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError(
          'Failed to insert a document in collection: ' + this._collection,
          err,
        ),
      );
    }
  }

  deleteOne(
    query: FilterQuery<T>,
  ): Observable<Either<UnexpectedError, number>> {
    return from(this.collection.deleteOne(query)).pipe(
      map((res) => {
        return right(res.deletedCount || 0);
      }),
      catchError((err) =>
        toLeftObs(
          new UnexpectedError(
            'Failed to delete an item in collection: ' + this._collection,
            err,
          ),
        ),
      ),
    );
  }

  count(query?: FilterQuery<T>): Observable<Either<UnexpectedError, number>> {
    try {
      return from(this.collection.countDocuments(query)).pipe(
        switchMap((res) => {
          return toRightObs(res);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError(
              'Failed to find the count in collection: ' + this._collection,
              err,
            ),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError(
          'Failed to find the count in collection: ' + this._collection,
          err,
        ),
      );
    }
  }

  findOne(
    query: FilterQuery<T>,
  ): Observable<Either<UnexpectedError, T | undefined>> {
    try {
      return from(this.collection.findOne(query)).pipe(
        switchMap((res) => {
          return toRightObs(res as T);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError(
              'Failed to find a document in collection: ' + this._collection,
              err,
            ),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError(
          'Failed to find a document in collection: ' + this._collection,
          err,
        ),
      );
    }
  }

  findAll(query: Dictionary = {}): Observable<Either<UnexpectedError, T[]>> {
    return of(this.collection.find(query)).pipe(
      switchMap((res) => {
        return from(res.toArray());
      }),
      switchMap((asArray) => {
        return toRightObs(asArray);
      }),
      catchError((err) => {
        return toLeftObs(
          new UnexpectedError(
            'Failed to find all documents in collection: ' + this._collection,
            err,
          ),
        );
      }),
    );
  }

  query<T>(cb: (conn: Db) => Observable<T>) {
    try {
      return cb(this.connection);
    } catch (err) {
      return throwError(
        new UnexpectedError(
          'Failed to execute query: ' + JSON.stringify(cb),
          err,
        ),
      );
    }
  }

  deleteAll() {
    return this.collection.deleteMany({});
  }

  save(
    data: T,
    filter?: FilterQuery<T>,
  ): Observable<Either<UnexpectedError, number>> {
    const target = filter || { public_id: data.public_id };

    try {
      return from(
        this.collection.updateOne(target, { $set: data }, { upsert: true }),
      ).pipe(
        switchMap((res) => {
          return toRightObs(res.matchedCount);
        }),
        catchError((err) => {
          return toLeftObs(
            new UnexpectedError(
              'Failed to save a document in collection: ' + this._collection,
              err,
            ),
          );
        }),
      );
    } catch (err) {
      return toLeftObs(
        new UnexpectedError(
          'Failed to save a document in collection: ' + this._collection,
          err,
        ),
      );
    }
  }
}
