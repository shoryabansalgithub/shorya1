import { Test, TestingModule } from '@nestjs/testing';
import { EventRouterService } from './event-router.service';

describe('EventRouterService', () => {
  let service: EventRouterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventRouterService],
    }).compile();

    service = module.get<EventRouterService>(EventRouterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
