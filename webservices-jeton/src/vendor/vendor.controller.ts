import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  PublicVendorResponseDto,
  UpdateVendorRequestDto,
  VendorListResponseDto,
} from './vendor.dto';
import { VendorService } from './vendor.service';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrivateRole, PublicRole } from '../auth/roles';
import { ParseUserIdPipe } from '../auth/pipes/parseUserId.pipe';
import { type Session } from '../types/auth';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { TransactionResponseDto } from '../transaction/transaction.dto';
import { TransactionService } from '../transaction/transaction.service';

@ApiTags('Vendors')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized - you need to be signed in',
})
@Controller('vendors')
export class VendorController {
  constructor(
    private readonly vendorService: VendorService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Get all vendors',
    type: VendorListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @Get()
  @Roles(PrivateRole.ADMIN)
  async getAllVendors(): Promise<VendorListResponseDto> {
    return this.vendorService.getAll();
  }

  @ApiResponse({
    status: 200,
    description: 'Get vendor by ID',
    type: PublicVendorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'me',
  })
  @Get(':id')
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  async getVendorById(
    @Param('id', ParseIntPipe) vendorId: number,
  ): Promise<PublicVendorResponseDto> {
    return this.vendorService.getById(vendorId);
  }

  @ApiResponse({
    status: 200,
    description: 'Update vendor by ID',
    type: PublicVendorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'me',
  })
  @Put(':id')
  @Roles(PrivateRole.ADMIN, PublicRole.VENDOR)
  async updateVendor(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
    @Body() updateVendorDto: UpdateVendorRequestDto,
  ): Promise<PublicVendorResponseDto> {
    const vendorId = id === 'me' ? user.id : id;
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.vendorService.updateById(
      user.id,
      vendorId,
      updateVendorDto,
      roles,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved list of transactions.',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'me',
  })
  @Get('/:id/transactions')
  @Roles(PrivateRole.ADMIN, PublicRole.VENDOR)
  async getTransactionsbyVendorId(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
  ): Promise<TransactionResponseDto[]> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    const vendorId = id === 'me' ? user.id : id;

    return await this.transactionService.getTransactionsByVendorId(
      user.id,
      vendorId,
      roles,
    );
  }
}
