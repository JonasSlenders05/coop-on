import { Body, Controller, Get, Param, Put } from '@nestjs/common';
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

@ApiTags('Vendors')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized - you need to be signed in',
})
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

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
    description: 'Update vendor by ID',
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
  async getVendorById(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
  ): Promise<PublicVendorResponseDto> {
    const userId = id === 'me' ? user.id : id;
    return this.vendorService.getById(userId);
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
  @Put(':id')
  @Roles(PrivateRole.ADMIN, PublicRole.VENDOR)
  async updateVendor(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
    @Body() updateVendorDto: UpdateVendorRequestDto,
  ): Promise<PublicVendorResponseDto> {
    const userId = id === 'me' ? user.id : id;
    return this.vendorService.updateById(userId, updateVendorDto);
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteVendor(@Param('id', ParseIntPipe) id: number): Promise<void> {
  //   return this.vendorService.deleteById(id);
  // }

  // @Get('/:id/transactions')
  // async getTransactionsbyWalletId(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<TransactionResponseDto[]> {
  //   return await this.vendorService.getTransactionByVendorId(id);
  // }
}
