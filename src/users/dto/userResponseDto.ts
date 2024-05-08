import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto implements User {
  id: number;
  email: string;
  name: string;

  @Exclude()
  addressId: number;
  @Exclude()
  role;

  @Exclude()
  address;

  @Exclude()
  posts;
  @Exclude()
  likes;
  @Exclude()
  carts;
  @Exclude()
  orders;

  @Exclude()
  password: string;
  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
}
