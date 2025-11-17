import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class PublicVendorResponseDto {
  @Expose()
  userId: number;
  @Expose()
  boothName: string;
}

export class VendorListResponseDto {
  items: PublicVendorResponseDto[];
}

export class UpdateVendorRequestDto {
  @IsString()
  boothName: string;
}
