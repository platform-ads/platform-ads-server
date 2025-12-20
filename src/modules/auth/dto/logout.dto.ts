import { IsString, IsOptional } from 'class-validator';

export class LogoutDto {
  @IsString()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}