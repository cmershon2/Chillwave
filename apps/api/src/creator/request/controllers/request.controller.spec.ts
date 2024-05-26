import { Test, TestingModule } from '@nestjs/testing';
import { RequestController } from './request.controller';
import { RequestService } from '../services/request.service';
import { Roles, User } from '@prisma/client';
import { UpdateCreatorRequest } from '../dto/update-creator-request.dto';
import { VerifyCreatorRequest } from '../dto/verify-creator-request.dto';
import { PersistenceModule } from '../../../persistence/persistence.module';

describe('RequestController', () => {
  let controller: RequestController;
  let service: RequestService;

  const mockRequestService = {
    create: jest.fn().mockResolvedValue({ id: 1, userId: 1 }),
    get: jest.fn().mockResolvedValue({ id: 1, userId: 1 }),
    update: jest.fn().mockResolvedValue({ id: 1, userId: 1, status: 'updated' }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
    verify: jest.fn().mockResolvedValue({ id: 1, emailId: 1, verified: true }),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    displayName: 'Test User',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [Roles.USER],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestController],
      imports: [PersistenceModule],
      providers: [
        {
          provide: RequestService,
          useValue: mockRequestService,
        },
      ],
    }).compile();

    controller = module.get<RequestController>(RequestController);
    service = module.get<RequestService>(RequestService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new request', async () => {
    const result = await controller.request(mockUser as User);
    expect(result).toEqual({ id: 1, userId: 1 });
    expect(service.create).toHaveBeenCalledWith(mockUser);
  });

  it('should fetch an existing request', async () => {
    const result = await controller.getRequest(1);
    expect(result).toEqual({ id: 1, userId: 1 });
    expect(service.get).toHaveBeenCalledWith(1);
  });

  it('should update a request as an admin', async () => {
    const updateDto: UpdateCreatorRequest = {
      rejectedAt: undefined,
      approvedAt: undefined,
      accountAge: 0,
      status: 'PENDING',
      reason: ''
    };
    const result = await controller.updateRequest(1, updateDto);
    expect(result).toEqual({ id: 1, userId: 1, status: 'updated' });
    expect(service.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('should delete a request', async () => {
    const result = await controller.deleteRequest(1);
    expect(result).toEqual({ id: 1 });
    expect(service.delete).toHaveBeenCalledWith(1);
  });

  it('should verify an email request', async () => {
    const verifyDto: VerifyCreatorRequest = { token: '123456' };
    const result = await controller.verifyEmailRequest(1, 1, verifyDto);
    expect(result).toEqual({ id: 1, emailId: 1, verified: true });
    expect(service.verify).toHaveBeenCalledWith(1, 1, verifyDto);
  });

  it('should handle error on fetch when request does not exist', async () => {
    jest.spyOn(service, 'get').mockRejectedValueOnce(new Error('Not Found'));
    await expect(controller.getRequest(2)).rejects.toThrow('Not Found');
  });

  it('should handle error on update when request does not exist', async () => {
    jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Not Found'));
    const updateDto: UpdateCreatorRequest = {
      rejectedAt: undefined,
      approvedAt: undefined,
      accountAge: 0,
      status: 'PENDING',
      reason: ''
    };
    await expect(controller.updateRequest(2, updateDto)).rejects.toThrow('Not Found');
  });

  it('should handle error on delete when request does not exist', async () => {
    jest.spyOn(service, 'delete').mockRejectedValueOnce(new Error('Not Found'));
    await expect(controller.deleteRequest(2)).rejects.toThrow('Not Found');
  });

  it('should handle error on verify when request does not exist', async () => {
    jest.spyOn(service, 'verify').mockRejectedValueOnce(new Error('Not Found'));
    const verifyDto: VerifyCreatorRequest = { token: '123456' };
    await expect(controller.verifyEmailRequest(2, 1, verifyDto)).rejects.toThrow('Not Found');
  });
});
