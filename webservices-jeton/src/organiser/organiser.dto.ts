import { Expose, Type } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { PublicUserResponseDto } from '../user/user.dto';

export class OrganiserResponseDto {
  @Expose()
  userId: number;

  @Expose()
  organisation: string;

  @Expose()
  @Type(() => PublicUserResponseDto)
  user: PublicUserResponseDto;
}

export class OrganiserListResponseDto {
  items: OrganiserResponseDto[];
}

export class UpdateOrganiserRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organisation: string;
}
