import { IsNumber, IsString } from 'class-validator';

export class OrganiserResponseDto {
  @IsNumber()
  userId: number;

  @IsString()
  organisation: string;
}

export class OrganiserListResponseDto {
  items: OrganiserResponseDto[];
}

export class UpdateOrganiserRequestDto {
  @IsString()
  organisation: string;
}
