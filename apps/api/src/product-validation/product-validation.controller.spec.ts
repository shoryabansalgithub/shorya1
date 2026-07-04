import { Test, TestingModule } from '@nestjs/testing';
import { ProductValidationController } from './product-validation.controller';

describe('ProductValidationController', () => {
  let controller: ProductValidationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductValidationController],
    }).compile();

    controller = module.get<ProductValidationController>(ProductValidationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
