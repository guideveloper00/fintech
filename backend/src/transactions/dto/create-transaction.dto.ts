import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString({ message: 'Descrição deve ser um texto' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor deve ser um número com no máximo 2 casas decimais' })
  @IsPositive({ message: 'Valor deve ser positivo' })
  amount: number;

  @IsEnum(TransactionType, { message: 'Tipo deve ser "income" ou "expense"' })
  type: TransactionType;

  @IsDateString({}, { message: 'Data inválida' })
  date: string;

  @IsOptional()
  @IsUUID('4', { message: 'Categoria inválida' })
  categoryId?: string;
}
