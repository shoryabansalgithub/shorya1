import { Test, TestingModule } from '@nestjs/testing';
import { ProductValidationService } from './product-validation.service';

describe('ProductValidationService', () => {
  let service: ProductValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductValidationService],
    }).compile();

    service = module.get<ProductValidationService>(ProductValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
