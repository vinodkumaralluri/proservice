import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCenterController } from './service-center.controller';

describe('ServiceCenterController', () => {
  let controller: ServiceCenterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceCenterController],
    }).compile();

    controller = module.get<ServiceCenterController>(ServiceCenterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
