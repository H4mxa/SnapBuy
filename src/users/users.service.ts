import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserNotFoundException } from './exceptions/userNotFound.exception';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async getById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async create(user: CreateUserDto) {
    const address = user.address;
    return this.prisma.user.create({
      data: {
        ...user,
        role: user.role,
        address: {
          create: address,
        },
      },
      include: {
        address: true,
      },
    });
  }

  async updateMany(userId) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRT: {
          not: null,
        },
      },
      data: {
        hashedRT: null,
      },
    });
  }

  async updateRefreshTokenHash({
    userId,
    hash,
  }: {
    userId: number;
    hash: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hashedRT: hash },
    });
  }
}
