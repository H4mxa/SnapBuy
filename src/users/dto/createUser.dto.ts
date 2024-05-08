import { Role } from '@prisma/client';
import { AddressDto } from './address.dto';
import { Exclude } from 'class-transformer';

export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  address?: AddressDto;
  role: Role;
}

export class RegisterResponseDto {
  email: string;
  name: string;
  role: Role;

  @Exclude()
  password: string;
  @Exclude()
  address: string;
  @Exclude()
  addressId: string;
  @Exclude()
  id: number;
  @Exclude()
  createdAt: string;
  @Exclude()
  updatedAt: string;
}
