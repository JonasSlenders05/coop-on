export class PublicVendorDto {
  id: number;
  boothName: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  phonenumber: string;
}

export class CreateVendorRequestDto {
  boothName: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  phonenumber: string;
}

export class VendorListResponseDto {
  items: VendorResponseDto[];
}

export class VendorResponseDto extends CreateVendorRequestDto {
  id: number;
}

export class UpdateVendorRequestDto extends CreateVendorRequestDto {}
