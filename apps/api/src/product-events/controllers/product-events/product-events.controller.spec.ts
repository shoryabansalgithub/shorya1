import { Test, TestingModule } from '@nestjs/testing';
import { ProductEventsController } from './product-events.controller';

describe('ProductEventsController', () => {
  let controller: ProductEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductEventsController],
    }).compile();

    controller = module.get<ProductEventsController>(ProductEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
