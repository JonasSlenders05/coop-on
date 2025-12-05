import { Expose, Type } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { PublicUserResponseDto } from '../user/user.dto';

export class PublicVendorResponseDto {
  @Expose()
  userId: number;
  @Expose()
  boothName: string;
  @Expose()
  @Type(() => PublicUserResponseDto)
  user: PublicUserResponseDto;
}

export class VendorListResponseDto {
  items: PublicVendorResponseDto[];
}

export class UpdateVendorRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  boothName: string;
}
