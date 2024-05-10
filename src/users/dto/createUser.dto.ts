import { Role } from '@prisma/client';
import { AddressDto } from './address.dto';
import { Exclude } from 'class-transformer';

export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  address?: AddressDto;
  hashedRT?: string;
  role: Role;
}

export class RegisterResponseDto {
  email: string;
  username: string;
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
