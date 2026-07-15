import { Test, TestingModule } from '@nestjs/testing';
import { StartupValidatorService } from './startup-validator.service';
import { ValidationEngine } from './validation.engine';
import { ValidationContext } from './validation.context';
import { ValidationSeverity } from './enums/validation-severity.enum';
import { ValidationCategory } from './enums/validation-category.enum';

describe('StartupValidatorService', () => {
  let service: StartupValidatorService;
  let validationEngine: jest.Mocked<ValidationEngine>;

  const originalExit = process.exit;
  let mockExit: jest.Mock;

  beforeEach(async () => {
    mockExit = jest.fn() as any;
    process.exit = mockExit as any;

    const mockValidationEngine = {
      validateAll: jest.fn(),
    };

    const mockValidationContext = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartupValidatorService,
        { provide: ValidationEngine, useValue: mockValidationEngine },
        { provide: ValidationContext, useValue: mockValidationContext },
      ],
    }).compile();

    service = module.get<StartupValidatorService>(StartupValidatorService);
    validationEngine = module.get(ValidationEngine);

    // Suppress console logs during tests to keep output clean
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.exit = originalExit;
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not exit if validation passes without errors', async () => {
    validationEngine.validateAll.mockResolvedValue([]);
    await service.onModuleInit();
    expect(mockExit).not.toHaveBeenCalled();
    expect(service['logger'].log).toHaveBeenCalledWith('Runtime Validation Passed. Configuration graph is valid.');
  });

  it('should not exit for WARNING severity errors', async () => {
    validationEngine.validateAll.mockResolvedValue([
      {
        domain: 'TestDomain',
        category: ValidationCategory.DOMAIN,
        severity: ValidationSeverity.WARNING,
        reason: 'This is a warning',
        resolution: 'Fix it',
      }
    ]);
    await service.onModuleInit();
    expect(mockExit).not.toHaveBeenCalled();
    expect(service['logger'].warn).toHaveBeenCalled();
  });

  it('should call process.exit(1) on HIGH severity errors', async () => {
    validationEngine.validateAll.mockResolvedValue([
      {
        domain: 'TestDomain',
        category: ValidationCategory.INFRASTRUCTURE,
        severity: ValidationSeverity.HIGH,
        reason: 'High issue',
        resolution: 'Fix it',
      }
    ]);
    await service.onModuleInit();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(service['logger'].error).toHaveBeenCalled();
  });

  it('should call process.exit(1) on CRITICAL severity errors', async () => {
    validationEngine.validateAll.mockResolvedValue([
      {
        domain: 'TestDomain',
        category: ValidationCategory.ENVIRONMENT,
        severity: ValidationSeverity.CRITICAL,
        reason: 'Critical issue',
        resolution: 'Fix it',
      }
    ]);
    await service.onModuleInit();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(service['logger'].error).toHaveBeenCalled();
  });
});
