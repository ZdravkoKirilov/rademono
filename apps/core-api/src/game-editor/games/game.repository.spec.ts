import { FullGame } from '@end/global';
import { UUIDv4 } from '@end/global/src/types';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { omit } from 'lodash';

import { GameDBModel, GameRepository } from './game.repository';

const throwError = () => {
  throw new Error('Unexpected code');
};

describe('GamesService', () => {
  let repository: GameRepository;

  describe('createNew', () => {
    const data = {
      public_id: UUIDv4.generate(),
      title: 'Game 1',
      description: 'Description',
      image: 'http://abv.bg',
    };

    it('saves a new entity and exposes "public_id" ', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GameRepository,
          {
            provide: getRepositoryToken(GameDBModel),
            useValue: {
              save: (payload: any) =>
                Promise.resolve({
                  ...payload,
                  id: 1,
                }),
            },
          },
        ],
      }).compile();

      repository = module.get<GameRepository>(GameRepository);

      const result = await repository.createNew(data).toPromise();

      if (isLeft(result)) {
        throwError();
      } else {
        expect(result.right).toEqual(data);
        expect(result.right).toBeInstanceOf(FullGame);
      }
    });
  });
});
