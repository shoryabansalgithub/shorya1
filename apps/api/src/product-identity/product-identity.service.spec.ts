import { Test, TestingModule } from '@nestjs/testing';
import { ProductIdentityService } from './product-identity.service';

describe('ProductIdentityService', () => {
  let service: ProductIdentityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductIdentityService],
    }).compile();

    service = module.get<ProductIdentityService>(ProductIdentityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
