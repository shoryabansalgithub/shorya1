import { Test } from '@nestjs/testing';

// Unit tests should exercise one class at a time.  Many legacy smoke tests
// declare only their subject under test; supplying inert mocks for undeclared
// collaborators lets Nest construct that subject without connecting to MySQL,
// Redis, queues, or external services.  Explicit providers in a test still
// take precedence over this fallback.
const createTestingModule = Test.createTestingModule.bind(Test);
jest.spyOn(Test, 'createTestingModule').mockImplementation((metadata) =>
  createTestingModule(metadata).useMocker(() => ({})),
);
