import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AccessGuard } from './../auth/guards/at.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AccessGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    const existedUser = await this.usersService.findOneByFilter({
      email: createUserDto.email,
    });

    if (existedUser) {
      throw new BadRequestException('User with such email already exists.');
    }

    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('No user found with such ID.');
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(AccessGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const existedUser = await this.usersService.findOne(id);

    if (!existedUser) {
      throw new NotFoundException("User with such ID doesn't exists.");
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AccessGuard)
  async remove(@Param('id') id: string) {
    const existedUser = await this.usersService.findOne(id);

    if (!existedUser) {
      throw new NotFoundException("User with such ID doesn't exists.");
    }
    return this.usersService.remove(id);
  }
}
