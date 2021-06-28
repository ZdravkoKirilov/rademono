import { PUBLIC_ID_GENERATOR } from '@app/shared';
import { UUIDv4 } from '@end/global';
import { Test, TestingModule } from '@nestjs/testing';
import { AssetRepository } from './asset.repository';
import { AssetService } from './asset.service';

describe('FilesService', () => {
  let service: AssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        {
          provide: AssetRepository,
          useValue: {},
        },
        {
          provide: PUBLIC_ID_GENERATOR,
          useValue: () => UUIDv4.generate,
        },
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
