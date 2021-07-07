import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './asset.service';
import { AssetsController } from './assets.controller';

describe('AssetsController', () => {
  let controller: AssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [{ provide: AssetService, useValue: {} }],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
