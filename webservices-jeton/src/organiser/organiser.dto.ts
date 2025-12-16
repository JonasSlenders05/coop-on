import { Expose, Type } from 'class-transformer';
import { IsString } from 'nestjs-swagger-dto';
import { PublicUserResponseDto } from '../user/user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class OrganiserResponseDto {
  @ApiProperty({
    description: 'The unique ID of the user who is the organiser',
    example: 42,
    format: 'int32',
  })
  @Expose()
  userId: number;

  @ApiProperty({
    name: 'organisation',
    example: 'Hogent',
    minLength: 2,
    maxLength: 255,
  })
  @Expose()
  organisation: string;

  @ApiProperty({
    description: 'The details of the useraccount of this organiser',

    type: () => PublicUserResponseDto,
  })
  @Expose()
  @Type(() => PublicUserResponseDto)
  user: PublicUserResponseDto;
}

export class OrganiserListResponseDto {
  @ApiProperty({ type: () => [OrganiserResponseDto] })
  items: OrganiserResponseDto[];
}

export class UpdateOrganiserRequestDto {
  @IsString({
    name: 'organisation',
    example: 'Hogent',
    minLength: 2,
    maxLength: 255,
  })
  organisation: string;
}
