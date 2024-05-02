import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/persistence/prisma/prisma.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { hash } from 'bcrypt'
import { UserUpdate } from '../dto/user-update.dto';

@Injectable()
export class UserService {

    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateUserDTO ): Promise<User> {
        const passwordHash = await hash(data.password, 10)
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
