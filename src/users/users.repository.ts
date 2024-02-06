import { User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prismaService: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    return await this.prismaService.user.create({ data: dto });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    return await this.prismaService.user.update({ where: { id }, data: dto });
  }

  async deleteUser(id: string): Promise<User> {
    return await this.prismaService.user.delete({ where: { id } });
  }

  async findUserByFilter(filter: any): Promise<User | null> {
    return await this.prismaService.user.findFirst({ where: filter });
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({ where: { id } });
  }

  async getUsersList(): Promise<User[] | null> {
    return await this.prismaService.user.findMany();
  }
}
