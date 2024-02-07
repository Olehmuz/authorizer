import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { RedisService } from './../redis/redis.service';
import { UsersRepository } from './../users/users.repository';
import { Tokens } from './intefaces/tokens.inteface';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private redisService: RedisService,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signIn(dto: SignInDto): Promise<Tokens> {
    const { email, password } = dto;
    const user = await this.usersRepository.findUserByFilter({ email });

    if (!user) {
      throw new UnauthorizedException('User with such email does not exist.');
    }

    const isPasswordCorrect = await compare(password, user.hashedPassword);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password.');
    }

    const { access_token, refresh_token } = await this.generateTokens(user);

    return {
      access_token,
      refresh_token,
    };
  }

  async signUp(dto: SignUpDto): Promise<Tokens> {
    const { email, password } = dto;

    const existedUser = await this.usersRepository.findUserByFilter({ email });

    if (existedUser) {
      throw new BadRequestException('User with such email already exists.');
    }

    const hashedPassword = await hash(password, +process.env.SALT!);

    const user = await this.usersRepository.createUser({
      email,
      hashedPassword,
    });

    return this.generateTokens(user);
  }

  async logout(id: string): Promise<string> {
    await this.redisService.del(id);
    return 'logouted!';
  }

  async refresh(id: string): Promise<Tokens> {
    if (!id) {
      throw new UnauthorizedException('User is not authorized.');
    }

    const user = await this.usersRepository.findUserByFilter({
      id,
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist.');
    }

    return this.generateTokens(user);
  }

  async generateTokens(payload: User): Promise<Tokens> {
    const tokenPayload = {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    };
    const accessPromise = this.jwtService.signAsync(tokenPayload, {
      expiresIn: '1h',
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    });

    const refreshPromise = this.jwtService.signAsync(tokenPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    });

    const [access_token, refresh_token] = await Promise.all([
      accessPromise,
      refreshPromise,
    ]);

    await this.redisService.set(payload.id, access_token, 3600);

    return {
      access_token,
      refresh_token,
    };
  }
}
