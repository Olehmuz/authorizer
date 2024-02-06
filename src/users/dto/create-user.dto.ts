import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  hashedPassword: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
