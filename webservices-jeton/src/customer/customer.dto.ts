export class PublicCustomerDto {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
}

export class CreateCustomerResquestDto {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
}

export class CustomerListResponseDto {
  items: CustomerResponseDto[];
}

export class CustomerResponseDto extends CreateCustomerResquestDto {
  id: number;
}

export class UpdateCustomerRequestDto extends CreateCustomerResquestDto {}
