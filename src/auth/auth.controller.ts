import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetCurrentUser } from 'src/common/decorators/get-user.decorator';
import { RedisService } from 'src/redis/redis.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshGuard } from './guards/rt.guard';
import { TokenPayload } from './intefaces/token.payload';
import { AccessGuard } from './guards/at.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  @Post('login')
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('register')
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AccessGuard)
  async logout(@GetCurrentUser() user: TokenPayload) {
    return this.authService.logout(user.sub);
  }

  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(RefreshGuard)
  async refresh(@GetCurrentUser() user: TokenPayload) {
    return this.authService.refresh(user.sub);
  }

  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(AccessGuard)
  async profile(@GetCurrentUser() user: TokenPayload) {
    return user;
  }
}
