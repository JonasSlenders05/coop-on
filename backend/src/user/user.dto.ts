import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { IsString } from 'nestjs-swagger-dto';
import { PublicRole } from '../auth/roles';

export class PublicUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    minimum: 1,
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'User firstname',
    minLength: 2,
    maxLength: 255,
    example: 'John',
  })
  @Expose()
  firstname: string;

  @ApiProperty({
    description: 'User lastname',
    minLength: 2,
    maxLength: 255,
    example: 'Doe',
  })
  @Expose()
  lastname: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@email.com',
    type: 'string',
    format: 'email',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User phonenumber',
    example: '+32471802753',
    type: 'string',
    minimum: 7,
    maximum: 14,
  })
  @Expose()
  phonenumber: string;

  @ApiProperty({
    description: 'User roles',
    example: ['customer', 'vendor'],
    enum: PublicRole,
    isArray: true,
  })
  @Expose()
  @IsEnum(PublicRole, { each: true })
  publicRoles: PublicRole[];
}

export class RegisterUserRequestDto {
  @IsString({ name: 'firstname', minLength: 2, maxLength: 255, example: 'Jan' })
  firstname: string;

  @IsString({
    name: 'lastname',
    minLength: 2,
    maxLength: 255,
    example: 'Klaassen',
  })
  lastname: string;

  @IsString({ name: 'email', example: 'user@email.com' })
  @IsEmail()
  email: string;

  @IsString({ name: 'phonenumber', example: '+32471802753' })
  phonenumber: string;

  @IsString({ name: 'password', minLength: 8, maxLength: 128 })
  password: string;

  @ValidateIf((o) => o.publicRoles?.includes(PublicRole.VENDOR))
  @IsNotEmpty()
  @IsString({
    name: 'boothName',
    minLength: 2,
    maxLength: 255,
  })
  boothName?: string;

  @ValidateIf((o) => o.publicRoles?.includes(PublicRole.ORGANISER))
  @IsNotEmpty()
  @IsString({
    name: 'organisation',
    minLength: 8,
    maxLength: 128,
  })
  organisation?: string;

  @ApiProperty({ enum: PublicRole, isArray: true })
  @IsEnum(PublicRole, { each: true })
  publicRoles: PublicRole[];
}

export class UpdateUserRequestDto {
  @ApiProperty({
    description: 'User firstname',
    required: false,
    minLength: 2,
    maxLength: 255,
    example: 'Jan',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstname?: string;

  @ApiProperty({
    description: 'User lastname',
    required: false,
    minLength: 2,
    maxLength: 255,
    example: 'Klaassen',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastname?: string;

  @ApiProperty({
    description: 'User email address',
    required: false,
    example: 'user@email.com',
    type: 'string',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User phonenumber',
    required: false,
    example: '+32471802753',
  })
  @IsOptional()
  @IsString()
  phonenumber?: string;
}

export class UserListResponseDto {
  @ApiProperty({ type: () => [PublicUserResponseDto] })
  items: PublicUserResponseDto[];
}
