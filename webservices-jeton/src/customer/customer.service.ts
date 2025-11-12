import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from 'src/drizzle/drizzle.provider';
import {
  CreateCustomerResquestDto,
  CustomerListResponseDto,
  CustomerResponseDto,
  UpdateCustomerRequestDto,
} from './customer.dto';
import { eq } from 'drizzle-orm';
import { customers } from 'src/drizzle/schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  async getAll(): Promise<CustomerListResponseDto> {
    const items = await this.db.query.customers.findMany();
    return { items };
  }

  async getById(id: number): Promise<CustomerResponseDto> {
    const customer = await this.db.query.customers.findFirst({
      where: eq(customers.id, id),
    });

    if (!customer) {
      throw new NotFoundException('No customer with this ID exists');
    }

    return customer;
  }

  async create(
    customer: CreateCustomerResquestDto,
  ): Promise<CustomerResponseDto> {
    const [newCustomer] = await this.db
      .insert(customers)
      .values(customer)
      .$returningId();
    return this.getById(newCustomer.id);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(customers)
      .where(eq(customers.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No customer with this ID exists');
    }
  }

  async updateById(
    id: number,
    changes: UpdateCustomerRequestDto,
  ): Promise<CustomerResponseDto> {
    await this.db.update(customers).set(changes).where(eq(customers.id, id));
    return this.getById(id);
  }
}
