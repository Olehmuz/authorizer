import { Body, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersRepository.createUser(createUserDto);
  }

  findAll() {
    return this.usersRepository.getUsersList();
  }

  findOne(id: string) {
    return this.usersRepository.findUserById(id);
  }

  update(id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersRepository.updateUser(id, updateUserDto);
  }

  remove(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}
