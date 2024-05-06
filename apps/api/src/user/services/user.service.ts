import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { UserUpdate } from '../dto/user-update.dto';
import { hashPassword } from '../utils/user.utils';

@Injectable()
export class UserService {

    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateUserDTO ): Promise<User> {
        const passwordHash = await hashPassword(data.password);

        const user = await this.prismaService.user.create({
            data:{
                email: data.email,
                displayName: data.displayName,
                password: passwordHash,
            }
        });

        return user;
    }

    // Find user by ID
    async findOne(id: number): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: id
            }
        })
    
        if (!user) {
          throw new NotFoundException(
            `There isn't any user with identifier: ${id}`,
          );
        }

        delete user.password;
    
        return user;
    }

    // Find user by Email
    async findOneByEmail(email: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: email
            }
        })
    
        if (!user) {
          throw new NotFoundException(
            `There isn't any user with email: ${email}`,
          );
        }
    
        return user;
    }

    async update(id: number, updates: UserUpdate): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: id
            }
        })
    
        if (!user) {
          throw new NotFoundException(`There isn't any user with identifier: ${id}`);
        }
    
        const updatedUser = this.prismaService.user.update({
            where:{
                id: id
            },
            data: updates
        });
    
        return updatedUser;
    }
}
