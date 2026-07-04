import { Test, TestingModule } from '@nestjs/testing';
import { ProductIdentityController } from './product-identity.controller';

describe('ProductIdentityController', () => {
  let controller: ProductIdentityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductIdentityController],
    }).compile();

    controller = module.get<ProductIdentityController>(ProductIdentityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
