import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { Status } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  public name: string;

  @IsEmail()
  public email: string;

  @IsBoolean()
  public is_admin: boolean;

  @IsString()
  public phone?: string;

  @IsString()
  public password: string;
}
