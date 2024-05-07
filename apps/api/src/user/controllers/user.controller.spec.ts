import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { Roles } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('should get a user', async () => {
    const userId = 1;
    const user = { 
      id: userId, 
      email: 'test@example.com', 
      displayName: 'Test User', 
      password: 'hashedPassword', 
      createdAt: new Date(), 
      updatedAt: new Date(), 
      roles: [Roles.USER]
    };
    jest.spyOn(userService, 'findOne').mockResolvedValue(user);

    const fetchedUser = await userController.get(userId);

    expect(fetchedUser).toEqual(user);
  });

  it('should update a user', async () => {
    const userId = 1;
    const updates = { displayName: 'Updated User' };
    const updatedUser = { 
      id: userId, 
      email: 'test@example.com', 
      displayName: 'Updated User', 
      password: 'hashedPassword', 
      createdAt: new Date(), 
      updatedAt: new Date(), 
      roles: [Roles.USER]
    };
    jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);

    const result = await userController.update(userId, updates);

    expect(result).toEqual(updatedUser);
  });

  it('should delete a user', async () => {
    const userId = 1;
    const deletedUser = { 
      id: userId, 
      email: 'test@example.com', 
      displayName: 'Deleted User', 
      password: 'hashedPassword', 
      createdAt: new Date(), 
      updatedAt: new Date(), 
      roles: [Roles.USER] 
    };
    jest.spyOn(userService, 'delete').mockResolvedValue(deletedUser);

    const result = await userController.delete(userId);

    expect(result).toEqual(deletedUser);
  });

  it('should throw NotFoundException on find one when user does not exist', async () => {
    const nonExistentUserId = 9999;
    jest.spyOn(userService, 'findOne').mockRejectedValue(new NotFoundException(`User with id ${nonExistentUserId} not found`));

    await expect(userController.get(nonExistentUserId)).rejects.toThrowError(NotFoundException);
  });

  it('should throw NotFoundException on update when user does not exist', async () => {
    const nonExistentUserId = 9999;
    const updates = { displayName: 'Updated User' };
    jest.spyOn(userService, 'update').mockRejectedValue(new NotFoundException(`User with id ${nonExistentUserId} not found`));

    await expect(userController.update(nonExistentUserId, updates)).rejects.toThrowError(NotFoundException);
  });

  it('should throw NotFoundException on delete when user does not exist', async () => {
    const nonExistentUserId = 9999;
    jest.spyOn(userService, 'delete').mockRejectedValue(new NotFoundException(`User with id ${nonExistentUserId} not found`));

    await expect(userController.delete(nonExistentUserId)).rejects.toThrowError(NotFoundException);
  });
});
