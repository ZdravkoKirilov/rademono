import { UUIDv4 } from '@end/global/src/types';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { GameDBModel, GameRepository } from './game.repository';

describe('GamesService', () => {
  let repository: GameRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameRepository,
        {
          provide: getRepositoryToken(GameDBModel),
          useValue: {
            save: () =>
              Promise.resolve({
                id: 1,
                public_id: UUIDv4.generate(),
                title: 'Game 1',
                description: 'Description',
                image: 'http://abv.bg',
              }),
          },
        },
      ],
    }).compile();

    repository = module.get<GameRepository>(GameRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
