import { IsBoolean, IsEmail, IsString } from 'class-validator';

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
