import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import * as xss from 'xss';

export class AuthSigninDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => xss.filterXSS(value.trim()))
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  @Transform(({ value }) => xss.filterXSS(value.trim()))
  password: string;
}
