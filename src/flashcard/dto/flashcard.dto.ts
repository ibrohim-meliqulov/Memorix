// src/flashcard/dto/flashcard.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    IsArray,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlashcardDto {
    @IsInt()
    deckId: number;

    @IsString()
    @IsNotEmpty()
    frontText: string;

    @IsString()
    @IsNotEmpty()
    backText: string;

    @IsOptional()
    @IsString()
    example?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpdateFlashcardDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    frontText?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    backText?: string;

    @IsOptional()
    @IsString()
    example?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

// AI natijasidan kelgan bitta karta
class FlashcardItemDto {
    @IsString()
    @IsNotEmpty()
    frontText: string;

    @IsString()
    @IsNotEmpty()
    backText: string;

    @IsOptional()
    @IsString()
    example?: string;
}

// Bir nechta flashcardni bitta deckga birdaniga saqlash uchun (AI natijasi)
export class BulkCreateFlashcardDto {
    @IsInt()
    deckId: number;

    @IsArray()
    @ArrayMinSize(1, { message: "Kamida 1 ta flashcard bo'lishi kerak" })
    @ValidateNested({ each: true })
    @Type(() => FlashcardItemDto)
    flashcards: FlashcardItemDto[];
}