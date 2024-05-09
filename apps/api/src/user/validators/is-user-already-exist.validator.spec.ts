import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { IsUserAlreadyExist } from './is-user-already-exist.validator';

describe('IsUserAlreadyExist Validator', () => {
  let validator: IsUserAlreadyExist;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsUserAlreadyExist,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    validator = module.get<IsUserAlreadyExist>(IsUserAlreadyExist);
  });

  it('should return true if user does not exist', async () => {
    const mockEmail = 'test@example.com';
    (validator['prismaService'].user.findUnique as jest.Mock).mockResolvedValue(null);

    const isValid = await validator.validate(mockEmail);

    expect(isValid).toBe(true);
  });

  it('should return false if user already exists', async () => {
    const mockEmail = 'test@example.com';
    (validator['prismaService'].user.findUnique as jest.Mock).mockResolvedValue({ email: mockEmail });

    const isValid = await validator.validate(mockEmail);

    expect(isValid).toBe(false);
  });

  it('should return default error message', () => {
    const defaultMessage = validator.defaultMessage();

    expect(defaultMessage).toBe('The email «$value» is already register.');
  });
});
