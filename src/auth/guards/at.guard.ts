import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from './../../redis/redis.service';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      });

      const activeToken = await this.redisService.get(payload.sub);
      if (!activeToken) {
        throw new UnauthorizedException(
          'User has been logged out. Please sign in.',
        );
      }

      if (activeToken !== token) {
        throw new UnauthorizedException('Invalid token. Try to sign in again.');
      }

      request['user'] = payload;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
