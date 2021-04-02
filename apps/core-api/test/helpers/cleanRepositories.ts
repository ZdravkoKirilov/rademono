import { Abstract, INestApplication } from '@nestjs/common';

type WithDeleteAll = Abstract<{
  deleteAll: () => Promise<unknown>;
}>;

export const cleanRepositories = (
  app: INestApplication,
  repos: WithDeleteAll[],
) => {
  return Promise.all(repos.map((repo) => app.get(repo).deleteAll()));
};
