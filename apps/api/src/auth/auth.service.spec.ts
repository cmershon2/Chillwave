import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/services/user.service';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { Roles, User } from '@prisma/client';
import { checkPassword, hashPassword } from '../user/utils/user.utils';

jest.mock('../user/utils/user.utils');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be an instanceof AuthService', () => {
    expect(authService).toBeInstanceOf(AuthService);
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
        password: await hashPassword(createUserDto.password),
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };
      jest.spyOn(userService, 'create').mockResolvedValueOnce(mockUser);

      const registeredUser = await authService.register(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(registeredUser).toEqual({
        id: expect.any(Number),
        email: createUserDto.email,
        displayName: createUserDto.displayName,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        roles: [Roles.USER],
      });
    });
  });

  describe('login', () => {
    it('should log in an existing user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser: User = {
        id: 1,
        email,
        displayName: 'Test User',
        password: await hashPassword(password),
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(mockUser);
      (
        checkPassword as jest.MockedFunction<typeof checkPassword>
      ).mockResolvedValueOnce(true);

      const loggedInUser = await authService.login(email, password);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(checkPassword).toHaveBeenCalledWith(password, mockUser.password);
      expect(loggedInUser).toEqual(mockUser);
    });

    it('should throw error on log in when the email not exist', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockRejectedValueOnce(new Error());

      await expect(authService.login(email, password)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw error on log in when the password does not match', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockUser: User = {
        id: 1,
        email,
        displayName: 'Test User',
        password: await hashPassword(password),
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(mockUser);
      (
        checkPassword as jest.MockedFunction<typeof checkPassword>
      ).mockResolvedValueOnce(false);

      await expect(authService.login(email, password)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  describe('verifyPayload', () => {
    it('should verify the JWT payload', async () => {
      const payload = { sub: 'test@example.com', iat: 0, exp: 0 };
      const mockUser: User = {
        id: 1,
        email: payload.sub,
        displayName: 'Test User',
        password: await hashPassword('password123'),
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(mockUser);

      const verifiedUser = await authService.verifyPayload(payload);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(payload.sub);
      expect(verifiedUser).toEqual(mockUser);
    });

    it("should throw on verify when JWT's subject not exist", async () => {
      const payload = { sub: 'nonexistent@example.com', iat: 0, exp: 0 };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockRejectedValueOnce(new Error());

      await expect(authService.verifyPayload(payload)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  describe('signToken', () => {
    it('should sign a new JWT', () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [Roles.USER],
      };

      const token = authService.signToken(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.email });
      expect(token).toBe('mock_jwt_token');
    });
  });
});
