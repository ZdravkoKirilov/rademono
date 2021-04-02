import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_COLLECTION, DATABASE_CONNECTION } from '../constants';
import { DbentityService } from './dbentity.service';

describe('DbentityService', () => {
  let service: DbentityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DATABASE_CONNECTION,
          useValue: {},
        },
        {
          provide: DATABASE_COLLECTION,
          useValue: 'whatever',
        },
        DbentityService,
      ],
    }).compile();

    service = module.get<DbentityService>(DbentityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
