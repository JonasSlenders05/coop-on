import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from 'src/auth/roles';

export class PublicUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstname: string;

  @Expose()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastname: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  phonenumber: string;
}

export class RegisterUserRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstname: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  phonenumber: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  boothName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organisation?: string;

  @IsEnum(Role, { each: true })
  role: Role;
}

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstname?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phonenumber?: string;
}

export class UserListResponseDto {
  items: PublicUserResponseDto[];
}
