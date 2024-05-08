import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RegisterDto } from './dto/Register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from 'src/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/register/admin')
  registerAdmin(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto, Role.ADMIN);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  registerUser(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto, Role.USER);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/admin')
  logInAdmin(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  logIn(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
