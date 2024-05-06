import { Test, TestingModule } from '@nestjs/testing';
import { Validate, useContainer, validate } from 'class-validator';

import { IsUserAlreadyExist } from './is-user-already-exist.validator';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { createMock } from 'ts-auto-mock';
import { Prisma } from '@prisma/client';

class UserDTO {
    @Validate(IsUserAlreadyExist)
    readonly email: string;
  
    constructor(email: string) {
      this.email = email;
    }
  }
  
  describe('IsUserAlreadyExist', () => {
    let prismaService: PrismaService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          IsUserAlreadyExist,
          {
            provide: PrismaService,
            useValue: createMock<PrismaService>({
              user: {
                findUnique: jest.fn().mockImplementation((where: Prisma.UserWhereUniqueInput) => {
                  if (where.email === 'john@doe.me') {
                    return createMock({ email: 'john@doe.me' });
                  }
                  return null;
                }),
              },
            }),
          },
        ],
      }).compile();
  
      prismaService = module.get<PrismaService>(PrismaService);
      useContainer(module, { fallbackOnErrors: true });
    });
  
    it.each([
      ['john@doe.me', 1],
      ['newuser@example.com', 0],
    ])('should validate whether the user already exists by their email', async (email, errors) => {
      const user = new UserDTO(email);
  
      await expect(validate(user)).resolves.toHaveLength(errors);
    });
  });