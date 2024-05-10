import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import * as xss from 'xss';

export class AuthSignupDto {
  // email
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => xss.filterXSS(value.trim()))
  email: string;

  // username
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(5, 10)
  @Matches(/^[a-z0-9_]*$/, {
    message:
      'username can only contain lowercase characters, digits, and underscores.',
  })
  @Transform(({ value }) => xss.filterXSS(value.trim()))
  username: string;

  // password
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 15)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message:
      'password must contain at least one uppercase character, a lowercase character, a digit, and a special character.',
  })
  @Transform(({ value }) => xss.filterXSS(value.trim()))
  password: string;
}
