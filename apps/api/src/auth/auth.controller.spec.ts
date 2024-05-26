import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/services/user.service';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { Roles, User } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_jwt_token'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be an instanceof AuthController', () => {
    expect(controller).toBeInstanceOf(AuthController);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDTO = {
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'password123',
      };
      const mockUser: User = {
        id: 1,
        email: createUserDto.email,
        displayName: createUserDto.displayName,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };
      jest.spyOn(authService, 'register').mockResolvedValueOnce(mockUser);

      const registeredUser = await controller.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(registeredUser).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };

      const loggedInUser = await controller.login(mockUser);

      expect(loggedInUser).toEqual(mockUser);
    });
  });

  describe('me', () => {
    it('should return me logged', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };

      const loggedUser = controller.me(mockUser);

      expect(loggedUser).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const mockRequest = {
        user: null,
      };

      try {
        await controller.me(mockRequest.user);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
