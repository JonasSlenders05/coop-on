import { Expose, Type } from 'class-transformer';
import { IsString } from 'nestjs-swagger-dto';
import { PublicUserResponseDto } from '../user/user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PublicVendorResponseDto {
  @ApiProperty({
    description: 'User ID',
    minimum: 1,
    example: 1,
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: "Name of the vendor's booth",
    minLength: 2,
    maxLength: 255,
    example: 'Mario Pizza',
  })
  @Expose()
  boothName: string;

  @ApiProperty({
    description: 'The details of the useraccount of this vendor',
    type: () => PublicUserResponseDto,
  })
  @Expose()
  @Type(() => PublicUserResponseDto)
  user: PublicUserResponseDto;
}

export class VendorListResponseDto {
  @ApiProperty({ type: () => [PublicVendorResponseDto] })
  items: PublicVendorResponseDto[];
}

export class UpdateVendorRequestDto {
  @IsString({
    name: 'boothName',
    example: 'De Frietkraam',
    description: "The name of the vendor's booth",
    minLength: 2,
    maxLength: 255,
  })
  boothName: string;
}
