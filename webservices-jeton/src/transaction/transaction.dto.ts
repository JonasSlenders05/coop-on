import { PublicVendorDto } from 'src/vendor/vendor.dto';
import { PublicWalletDto } from 'src/wallet/wallet.dto';

export class CreateTransactionRequestDto {
  walletId: number;
  vendorId: number;
  date?: Date = new Date();
  amount: number;
}

export class UpdateTransactionRequestDto extends CreateTransactionRequestDto {}

export class TransactionResponseDto {
  id: number;
  date: Date;
  amount: number;
  wallet: PublicWalletDto;
  vendor: PublicVendorDto;
}

export class TransactionListResponseDto {
  items: TransactionResponseDto[];
}
