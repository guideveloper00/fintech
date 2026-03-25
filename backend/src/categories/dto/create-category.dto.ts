import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser um texto' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  description?: string;
}
