import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { IsString } from 'nestjs-swagger-dto';

export class LoginRequestDto {
  @IsString({
    name: 'email',
    example: 'user@email.com',
  })
  @IsEmail()
  email: string;

  @IsString({ name: 'password', minLength: 8, maxLength: 128 })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT token for authentication' })
  token: string;
}
