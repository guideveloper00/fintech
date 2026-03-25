import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Senha atual deve ser uma string' })
  @MinLength(6, { message: 'Senha atual deve ter pelo menos 6 caracteres' })
  currentPassword?: string;

  @IsOptional()
  @IsString({ message: 'Nova senha deve ser uma string' })
  @MinLength(6, { message: 'Nova senha deve ter pelo menos 6 caracteres' })
  @MaxLength(100, { message: 'Nova senha deve ter no máximo 100 caracteres' })
  newPassword?: string;

  @IsOptional()
  @IsString({ message: 'Avatar deve ser uma string' })
  avatarUrl?: string | null;
}
