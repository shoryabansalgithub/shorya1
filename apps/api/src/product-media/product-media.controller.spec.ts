import { Test, TestingModule } from '@nestjs/testing';
import { ProductMediaController } from './product-media.controller';

describe('ProductMediaController', () => {
  let controller: ProductMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductMediaController],
    }).compile();

    controller = module.get<ProductMediaController>(ProductMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
