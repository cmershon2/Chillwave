import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDTO = { 
      email: 'test@example.com', 
      displayName: 'Test User', 
      password: 'password' 
    };
    const createdUser = await userService.create(createUserDTO);

    expect(createdUser.email).toBe(createUserDTO.email);
    expect(createdUser.displayName).toBe(createUserDTO.displayName);
  });

  it('should find one user', async () => {
    const user = await userService.findOne(1);
    expect(user).toBeDefined();
  });

  it('should throw NotFoundException on find one when user does not exist', async () => {
    const nonExistentUserId = 9999;
    await expect(userService.findOne(nonExistentUserId)).rejects.toThrowError(NotFoundException);
  });

  it('should find one user by email', async () => {
    const user = await userService.findOneByEmail('test@example.com');
    expect(user).toBeDefined();
  });

  it('should throw NotFoundException on find one by email when user does not exist', async () => {
    const nonExistentUserEmail = 'hello@world.com';
    await expect(userService.findOneByEmail(nonExistentUserEmail)).rejects.toThrowError(NotFoundException);
  });

  it('should update a user', async () => {
    const updates = { displayName: 'Updated User' };
    const updatedUser = await userService.update(1, updates);
    expect(updatedUser.displayName).toBe(updates.displayName);
  });

  it('should throw NotFoundException on update when user does not exist', async () => {
    const nonExistentUserId = 9999;
    const updates = { displayName: 'Updated User' };
    await expect(userService.update(nonExistentUserId, updates)).rejects.toThrowError(NotFoundException);
  });

  it('should delete one user', async () => {
    // Find previously created user
    const user = await userService.findOneByEmail('test@example.com');

    // Delete the user
    const deletedUser = await userService.delete(user.id);

    expect(deletedUser.id).toBe(user.id);
    // Check that the user is deleted by trying to find it again (it should throw NotFoundException)
    await expect(userService.findOne(user.id)).rejects.toThrowError(NotFoundException);
  });

  it('should throw NotFoundException on delete when user does not exist', async () => {
    const nonExistentUserId = 9999;
    await expect(userService.delete(nonExistentUserId)).rejects.toThrowError(NotFoundException);
  });
});
