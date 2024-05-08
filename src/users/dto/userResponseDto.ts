import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto implements User {
  role;

  @Exclude()
  id: number;
  @Exclude()
  email: string;
  @Exclude()
  name: string;

  @Exclude()
  addressId: number;

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
