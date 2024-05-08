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
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/Register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

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
  @Post('login')
  logIn(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Headers('authorization') authToken: string) {
    return this.authService.logout(authToken);
  }

  @Get('profile')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  getProfile(@Request() req) {
    return {
      user: 'success',
    };
  }
}
