import { Abstract, INestApplication } from '@nestjs/common';
import fs from 'fs';

type WithDeleteAll = Abstract<{
  deleteAll: () => Promise<unknown>;
}>;

export const cleanRepositories = (
  app: INestApplication,
  repos: WithDeleteAll[],
) => {
  return Promise.all(repos.map((repo) => app.get(repo).deleteAll()));
};

export const deleteTestFiles = (basePath: string) => {
  return new Promise((resolve, reject) => {
    try {
      fs.rmSync(basePath + '/test_uploads', { recursive: true });
      resolve(undefined);
    } catch (err) {
      reject(err);
    }
  });
};
