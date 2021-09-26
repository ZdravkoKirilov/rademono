import { Db, MongoClient } from 'mongodb';

export type DBConnection = { client: MongoClient; connection: Db };

export { FilterQuery } from 'mongodb';
