// src/deck/dto/deck.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateDeckDto {
    @IsInt()
    userId: number; // Hozircha qo'lda yuboramiz, Auth modul tayyor bo'lgach token'dan olinadi

    @IsString()
    @IsNotEmpty({ message: "Deck nomi bo'sh bo'lishi mumkin emas" })
    title: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateDeckDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;
}