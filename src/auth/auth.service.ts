import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/Register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaError } from 'src/utils/prismaError';
import { UserNotFoundException } from 'src/users/exceptions/userNotFound.exception';
import { UserResponseDto } from 'src/users/dto/userResponseDto';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registerUser(
    registrationData: RegisterDto,
    role: Role,
  ): Promise<Partial<RegisterDto>> {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
        role,
      });

      return plainToClass(CreateUserDto, createdUser);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error?.code === PrismaError.UniqueConstraintFailed
      ) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(data: LoginDto) {
    const user: User = await this.usersService.getByEmail(data.email);

    if (!user) {
      throw new UserNotFoundException();
    }

    await this.verifyPassword(data.password, user.password);

    const payload = { userId: user.id, user: user.name, role: user.role };
    let access_token = await this.jwtService.sign(payload);

    let response = {
      ...user,
      access_token,
    };

    return plainToClass(UserResponseDto, response);
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }
}
