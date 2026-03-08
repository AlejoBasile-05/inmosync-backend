import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsInt, 
  Min, 
  IsArray, 
  IsIn, 
  IsOptional, 
  MinLength,
} from 'class-validator';

export class CreatePropertyDto {
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres.' })
  title: string;

  @IsString({ message: 'El tipo debe ser un texto.' })
  @IsIn(['apartment', 'house', 'commercial', 'land'], { 
    message: 'El tipo de propiedad debe ser apartment, house, commercial o land.' 
  })
  type: string;

  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  price: number;

  @IsString({ message: 'La ubicación debe ser un texto.' })
  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  location: string;

  @IsInt({ message: 'La cantidad de camas debe ser un número entero.' })
  @Min(0, { message: 'La cantidad de camas no puede ser negativa.' })
  beds: number;

  @IsInt({ message: 'La cantidad de baños debe ser un número entero.' })
  @Min(0, { message: 'La cantidad de baños no puede ser negativa.' })
  baths: number;

  @IsInt({ message: 'Los metros cuadrados deben ser un número entero.' })
  @Min(0, { message: 'Los metros cuadrados no pueden ser negativos.' })
  sqft: number;

  @IsString({ message: 'La divisa debe ser un texto.' })
  @IsIn(['USD', 'ARS', 'EUR'], { message: 'La divisa debe ser USD, ARS o EUR.' })
  currency: string;

  @IsArray({ message: 'Las características deben ser un arreglo de textos.' })
  @IsString({ each: true, message: 'Cada característica debe ser un texto válido.' })
  @IsOptional()
  characteristics: string[];

  @IsString({ message: 'La URL de la imagen principal debe ser un texto.' })
  @IsNotEmpty({ message: 'La imagen principal es obligatoria.' })
  mainImageUrl: string;
}