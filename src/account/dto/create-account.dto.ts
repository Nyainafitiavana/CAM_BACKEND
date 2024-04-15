import { IsNumber, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  public designation: string;

  @IsString()
  public description: string;

  @IsNumber()
  public year: number;
}
