import { Test, TestingModule } from '@nestjs/testing';
import { ProductEventPublisherService } from './product-event-publisher.service';

describe('ProductEventPublisherService', () => {
  let service: ProductEventPublisherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductEventPublisherService],
    }).compile();

    service = module.get<ProductEventPublisherService>(ProductEventPublisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
