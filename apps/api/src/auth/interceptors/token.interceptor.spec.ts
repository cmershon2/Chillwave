// token.interceptor.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TokenInterceptor } from './token.interceptor';
import { AuthService } from '../auth.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { Roles, User } from '@prisma/client';
import { lastValueFrom } from 'rxjs';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenInterceptor,
        {
          provide: AuthService,
          useValue: {
            signToken: jest.fn().mockReturnValue('mock_jwt_token'),
          },
        },
      ],
    }).compile();

    interceptor = module.get<TokenInterceptor>(TokenInterceptor);
    authService = module.get<AuthService>(AuthService);
  });

  it('should add the token to the response', async () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      displayName: 'Test User',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [Roles.USER],
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          setHeader: jest.fn(),
          cookie: jest.fn(),
        }),
      }),
    };

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(mockUser)),
    };

    const observable = interceptor.intercept(
      mockExecutionContext as unknown as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    const result = await lastValueFrom(observable);

    expect(authService.signToken).toHaveBeenCalledWith(mockUser);

    const mockResponse = mockExecutionContext.switchToHttp().getResponse();
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Authorization',
      `Bearer mock_jwt_token`,
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'token',
      'mock_jwt_token',
      {
        httpOnly: true,
        signed: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      },
    );

    expect(result).toEqual(mockUser);
  });
});
